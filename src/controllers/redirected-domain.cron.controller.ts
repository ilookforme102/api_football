import { FastifyReply } from "fastify";
import { db } from "@/utils";
// import { Domain } from "domain";
// import { DomainInfor } from "@/controllers/domain-subdomain.cron.controller";
interface RulesResponse {
  result: {
    rules: any[];
  } | null;
  success: boolean;
  errors: any[];
  messages: any[];
}
interface Record {}

// export const get_all_domainS = async () => {
//     try {
//         const all_domain = await db.domain.findMany({
//             select: {
//                 id: true,
//                 domain: true,
//             },
//         });
//         return all_domain;
//     } catch (error) {
//         console.log(error);
//     }
// };
const CLOUDFLARE_API_URL: string = "https://api.cloudflare.com/client/v4/zones";
const extract_domain = (url: string) => {
  const regex = /https:\/\/([^"]+)/;

  // Use the regex to find the match
  const match = url.match(regex);

  // Extract the domain part from the match
  let domain: string = "";
  if (match && match[1]) {
    domain = match[1];
  }
  return domain;
};
export const get_domain_redirect_history = async (
  domain: any,
  reply: FastifyReply
) => {
  const url = `${CLOUDFLARE_API_URL}/${domain.id}/rulesets/phases/http_request_dynamic_redirect/entrypoint`;
  try {
    const response = await fetch(url, {
      headers: {
        "X-Auth-Email": domain.cf_account_email!,
        "X-Auth-Key": domain.cf_account.auth_key!,
        "Content-Type": "application/json",
      },
    });
    const data = (await response.json()) as RulesResponse;
    if (data) {
      console.log(data);
      if (data.success === false || !data.result) {
        console.log("No rules found for this domain");
        console.log(domain.id);
        console.log(domain.domain);
      } else {
        console.log(data.success);
        console.log(data.result.rules);
        for (const record of data.result!.rules) {
          const redirect_record = await db.redirected_domain.findFirst({
            where: {
              current_domain_id: domain.id,
            },
          });
          if (redirect_record) {
            if (
              redirect_record.target_domain !==
              extract_domain(
                record.action_parameters.from_value.target_url.expression
              )
            ) {
              await db.redirected_domain.update({
                where: {
                  id: redirect_record.id,
                },
                data: {
                  target_domain: extract_domain(
                    record.action_parameters.from_value.target_url.expression
                  ),
                },
              });
            }
          } else {
            console.log(
              extract_domain(
                record.action_parameters.from_value.target_url.expression
              )
            );
            await db.redirected_domain.create({
              data: {
                target_domain: extract_domain(
                  record.action_parameters.from_value.target_url.expression
                ),
                current_domain_id: domain.id,
              },
            });
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};
