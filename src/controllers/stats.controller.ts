import { db, errorHandler } from "@/utils";
import { FastifyReply, FastifyRequest } from "fastify";

export const getTotalWebsitesAndDomains = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  try {
    const totalWebsites = await db.domain.count({
      where: { is_achieved: false },
    });
    const totalVps = await db.vps.count({
      where: {
        is_achieved: false,
      },
    });
    return res.send({
      totalWebsites,
      totalVps,
    });
  } catch (error: any) {
    return errorHandler(error, res);
  }
};

export const getNumberOfWebsitesPerCloudFlare = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  try {
    const vps_accounts = await db.vps_account.findMany({
      select: {
        _count: {
          select: { vps: true },
        },
      },
    });
    return res.send(vps_accounts);
  } catch (error: any) {
    return errorHandler(error, res);
  }
};

export const getDomainsPerCloudFlare = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  try {
    const domainsPerCloudflare = await db.cf_account.findMany({
      select: {
        _count: {
          select: {
            domains: true,
          },
        },
        email: true,
      },
    });
    return res.send(domainsPerCloudflare);
  } catch (error: any) {
    return errorHandler(error, res);
  }
};

export const getTotalVPSByEachProvider = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  try {
    const vps_accounts = await db.vps_account.findMany({
      where: {
        is_achieved: false,
      },
      select: {
        id: true,
        email: true,
        provider_name: true,
      },
    });

    const result: any = [];
    const uniqueProvider: { [key: string]: number } = {};
    for (let index = 0; index < vps_accounts.length; index++) {
      const vps_acc = vps_accounts[index];
      const total_vps = await db.vps.count({
        where: { vps_account_id: vps_acc.id, is_achieved: false },
      });

      if (uniqueProvider[vps_acc.provider_name as string]) {
        uniqueProvider[vps_acc.provider_name as string] += total_vps;
      } else {
        uniqueProvider[vps_acc.provider_name as string] = total_vps;
      }
    }
    return res.send(uniqueProvider);
  } catch (error: any) {
    return errorHandler(error, res);
  }
};

export const getDomainsPerVPS = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  try {
    const vps = await db.vps.findMany({
      where: {
        is_achieved: false,
      },
      select: {
        _count: {
          select: {
            domains: true,
            sub_domains: true,
          },
        },
        ipv4_public: true,
        id: true,
      },
    });

    const dataSet: any = {};
    vps.forEach((v) => {
      const totalDomain = v._count.domains + v._count.sub_domains;
      const dataKey =
        totalDomain + `${totalDomain <= 1 ? " domain" : " domains"}`;
      if (dataSet[dataKey]) {
        dataSet[dataKey].vps_count += 1;
        dataSet[dataKey].vpses.push({
          ipv4: v.ipv4_public,
          id: v.id,
        });
      } else {
        dataSet[dataKey] = {};
        dataSet[dataKey].vps_count = 1;
        dataSet[dataKey].vpses = [
          {
            ipv4: v.ipv4_public,
            id: v.id,
          },
        ];
      }
    });
    return res.send(dataSet);
  } catch (error: any) {
    return errorHandler(error, res);
  }
};

export const getSumOfVPS = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const vpses = await db.vps.findMany({
      select: { price_monthly: true },
      where: {
        price_monthly: {
          gte: 0,
        },
      },
    });
    return res.send({
      total_montly_spend: vpses.reduce(
        (accumulator, vps) => accumulator + (vps?.price_monthly || 0),
        0
      ),
    });
  } catch (error: any) {
    return errorHandler(error, res);
  }
};

export const personInChargeWithWebsites = async (
  req: FastifyRequest,
  res: FastifyReply
) => {
  try {
    const users = await db.user.findMany({
      where: {
        pic: {
          some: {
            is_achieved: false,
          },
        },
        is_achieved: false,
      },
      select: {
        username: true,
        pic: {
          select: { domain: { select: { row_id: true, domain: true } } },
        },
      },
    });
    res.send(users);
  } catch (error) {
    return errorHandler(error, res);
  }
};
