import { FastifyReply, FastifyRequest } from "fastify";
import { db, errorHandler } from "@/utils";
// import { DomainDto } from "@/dto/domain.dto";
// import { db, errorHandler } from "@/utils";
// import { DomainDto } from "@/dto/domain.dto";
// Define funtion to get data from cloudflare
interface CloudflareResponse {
  result: any[];
  success: boolean;
  errors: any[];
  result_info: {
    total_pages: number;
  };
}
interface CfAccount {
  email: string;
  auth_key: string;
}
// id                 String              @id @db.VarChar(256)
// cf_account_email   String?             @db.VarChar(256)
// domain             String              @unique @db.VarChar(256)
// name_servers       Json
// createdAt          DateTime            @default(now())
// updatedAt          DateTime            @updatedAt
// hosted_vps_id      Int?
// is_achieved        Boolean             @default(false)
// cf_account         cf_account?         @relation(fields: [cf_account_email], references: [email])
// dns_records        dns_record[]
// hosted_vps         vps?                @relation(fields: [hosted_vps_id], references: [id])
// pics               pic[]
// redirected_domains redirected_domain[]
// sub_domains        sub_domain[]
interface DomainCron {
  id: string;
  cf_account_email: string;
  domain: string;
  name_servers: string[];
}

const CLOUDFLARE_API_URL = "https://api.cloudflare.com/client/v4/zones";
export const get_all_cf_accounts = async () => {
  try {
    const cfAccounts:CfAccount[] = await db.cf_account.findMany({
      select: {
        email: true,
        auth_key: true,
      },
    });
    return cfAccounts;
  } catch (error:any) {
    console.log(error);
  }
};
export const fetchAllDomains = async (account: CfAccount) => {
  let allDomains: any[] = [];
  let page = 1;
  let totalPages = 1;
  let per_page = 100;

  while (page <= totalPages) {
    const response = await fetch(`${CLOUDFLARE_API_URL}?per_page=${per_page}&page=${page}`, {
      headers: {
        "X-Auth-Email": account.email,
        "X-Auth-Key": account.auth_key,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json() as CloudflareResponse;

    if (data.success) {
      for (const domain of data.result) {
        const domainExists = await db.domain.findUnique({
          where: {
            id: domain.id,
          },
        });

        if (domainExists) {
          // Domain with same id already exists in the database
          // Check if cf_account_email, name_servers, and domain are different
          if (
            domainExists.cf_account_email !== account.email ||
            JSON.stringify(domainExists.name_servers) !== JSON.stringify(domain.name_servers) ||
            domainExists.domain !== domain.name
          ) {
            // Update the data in the database
            await db.domain.update({
              where: {
                id: domain.id,
              },
              data: {
                cf_account_email: account.email,
                name_servers: domain.name_servers,
                domain: domain.name,
              },
            });
          }
        } 
        else {
          const domain_info: DomainCron = {
            id: domain.id,
            cf_account_email: account.email,
            name_servers: domain.name_servers,
            domain: domain.name,
          };
          await db.domain.create({
            data: domain_info,
          });
        }
      }
      // allDomains = allDomains.concat(data.result);
      totalPages = data.result_info.total_pages;
      page++;
    } 
    else {
      throw new Error(`Failed to fetch data: ${JSON.stringify(data.errors)}`);
    }
  }

  return `All domains for ${account.email}fetched successfully`;
}

// export const get_all_domain_from_cf = async ( 
//   req: FastifyRequest<{
//     Querystring: {
//       page: number;
//       per_page: number;
//     };
//   }>,
//   reply: FastifyReply,
//   email: string,
//   key: string
// ) => {
//   try {
//     const page = req.query.page || 1;
//     const per_page = req.query.per_page || 12;
//     const url = `https://api.cloudflare.com/client/v4/zones?page=${page}&per_page=${per_page}`;
//     const response = await fetch(url, {
//       headers: {
//         "X-Auth-Email": email,
//         "X-Auth-Key": key,
//         "Content-Type": "application/json",
//       },
//     });

//     const data = await response.json();
//     reply.code(200).send(data);
//   } catch (error) {
//     reply.code(500).send({ error: "Failed to fetch data" });
//   }
// };