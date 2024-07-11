import { FastifyReply, FastifyRequest } from "fastify";
import { db, errorHandler } from "@/utils";
interface VpsAccount {
  id: number;
  provider_name: string | null;
  access_token: string;
  api_url: string;
}
interface DigitalOceanRseponse {
  droplets: any[];
  links: any;
  meta: any;
}
interface Vps {
  id?: number;
  region_name?: string;
  networks: {
    v4?: {
      type: string;
      ip_address: string;
    }[];
    v6?: {
      type: string;
      ip_address: string;
    }[];
  };
  vps_id?: number;
  region?: string;
  region_slug: string | null;
  status: string | null;
  memory: number | null;
  disk: number | null;
  vcpu: number | null;
  price_monthly: number | null;
  price_hourly: number | null;
  operating_system: string | null;
  vps_account_id: number | null;
  ipv4_private: string | null;
  ipv4_public: string | null;
  ipv6: string | null;
}
export const get_all_vps_accounts = async () => {
  try {
    const vpsAccounts: VpsAccount[] = await db.vps_account.findMany({
      select: {
        id: true,
        provider_name: true,
        access_token: true,
        api_url: true,
      },
    });
    return vpsAccounts;
  } catch (error: any) {
    console.log(error);
  }
};
export const fetch_vps = async (vps_account: VpsAccount) => {
  // let all_vps: any[] = [];
  // const vps_account= await get_all_vps_accounts();
  let page = 1;
  let totalPages = 1;
  let per_page = 100;
  while (page <= totalPages) {
    if (vps_account.provider_name === "DigitalOcean, LLC") {
      const response = await fetch(
        `${vps_account.api_url}?page=${page}&per_page=${per_page}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${vps_account.access_token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = (await response.json()) as DigitalOceanRseponse;
      if (data.droplets.length === 0) {
        throw new Error(`Error: No droplets found`);
      }
      for (const droplet of data.droplets) {
        const vpsExisted = await db.vps.findUnique({
          where: {
            ipv4_public: droplet.networks.v4.find(
              (network: any) => network.type === "public"
            ).ip_address,
          },
        });
        if (vpsExisted) {
          if (
            vpsExisted.vps_id !== droplet.id ||
            vpsExisted.region !== droplet.region.name ||
            vpsExisted.region_slug !== droplet.region.slug ||
            vpsExisted.status !== droplet.status ||
            vpsExisted.memory !== droplet.memory ||
            vpsExisted.disk !== droplet.disk ||
            vpsExisted.vcpu !== droplet.vcpus ||
            vpsExisted.price_monthly !== droplet.size.price_monthly ||
            vpsExisted.price_hourly !== droplet.size.price_hourly ||
            vpsExisted.operating_system !== droplet.image.distribution ||
            vpsExisted.ipv4_private !==
              droplet.networks.v4.find(
                (network: any) => network.type === "private"
              ).ip_address ||
            vpsExisted.ipv4_public !==
              droplet.networks.v4.find(
                (network: any) => network.type === "public"
              ).ip_address ||
            vpsExisted.ipv6 !== droplet.networks.v6[0]?.ip_address ||
            vpsExisted.vps_account_id !== vps_account.id
          ) {
            // Update the data in the database
            await db.vps.update({
              where: {
                ipv4_public: droplet.networks.v4.find(
                  (network: any) => network.type === "public"
                ).ip_address,
              },
              data: {
                vps_id: droplet.id,
                region: droplet.region.name,
                region_slug: droplet.region.slug,
                status: droplet.status,
                memory: droplet.memory,
                disk: droplet.disk,
                vcpu: droplet.vcpus,
                price_monthly: droplet.size.price_monthly,
                price_hourly: droplet.size.price_hourly,
                operating_system: droplet.image.distribution,
                ipv4_private: droplet.networks.v4.find(
                  (network: any) => network.type === "private"
                ).ip_address,
                ipv4_public: droplet.networks.v4.find(
                  (network: any) => network.type === "public"
                ).ip_address,
                ipv6: droplet.networks.v6[0]?.ip_address,
                vps_account_id: vps_account.id,
              },
            });
          }
        } else {
          const vps_info = {
            vps_id: droplet.id,
            region: droplet.region.name,
            region_slug: droplet.region.slug,
            status: droplet.status,
            memory: droplet.memory,
            disk: droplet.disk,
            vcpu: droplet.vcpus,
            price_monthly: droplet.size.price_monthly,
            price_hourly: droplet.size.price_hourly,
            operating_system: droplet.image.distribution,
            ipv4_private: droplet.networks.v4.find(
              (network: any) => network.type === "private"
            ).ip_address,
            ipv4_public: droplet.networks.v4.find(
              (network: any) => network.type === "public"
            ).ip_address,
            ipv6: droplet.networks.v6[0]?.ip_address,
            vps_account_id: vps_account.id,
          };
          await db.vps.create({
            data: vps_info,
          });
        }
      }
    } else {
      throw new Error(`Error: ${vps_account.provider_name} is not supported`);
    }
    page++;
  }
  // for (const account of vps_account) {
};
