// Reboot a VPS with one click xD
import { FastifyReply, FastifyRequest } from "fastify";
import { db, errorHandler } from "@/utils";
interface VpsAccount {
  id: number;
  vps_id?: number;
  vps_account?: {
    access_token: string;
  };
}
interface VpsPowerOff {
  action: {
    id: string;
    status?: string;
    type?: string;
    started_at?: string;
    completed_at?: string;
  };
}
interface ActionStatus {
  action: {
    id: number;
    status: string;
    type: string;
    started_at?: string;
    completed_at?: string;
    resource_id?: number;
  };
}
const DIGITALOCEAN_API_URL: string = "https://api.digitalocean.com/v2/droplets";
const DIGITALOCEAN_ACTION_STATUS_URL: string =
  "https://api.digitalocean.com/v2/actions";
export const get_vps_info = async (id: number) => {
  // try {
  const vpsAccounts: any = await db.vps.findFirst({
    select: {
      id: true,
      vps_id: true,
      vps_account: {
        select: {
          access_token: true,
        },
      },
    },
    where: {
      vps_id: id,
    },
  });
  return vpsAccounts;
  // } catch (error: any) {
  // console.log(error);
  // }
};
export const vps_power_off = async (vpsAccount: VpsAccount) => {
  const url: string = `${DIGITALOCEAN_API_URL}/${vpsAccount.vps_id}/actions`;
  // try {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${vpsAccount.vps_account?.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "power_off",
    }),
  });
  // console.log(url);
  // console.log(vpsAccount.vps_account?.access_token);
  const data = (await response.json()) as VpsPowerOff;
  if (data) {
    return {
      action_id: data.action.id,
      status: data.action.status,
      type: data.action.type,
      started_at: data.action.started_at,
      completed_at: data.action.completed_at,
    };
  } else {
    return { status: "500", message: "VPS power off failed" };
  }
  // } catch (error: any) {
  // console.log(error);
  // }
};
export const vps_power_on = async (vpsAccount: VpsAccount) => {
  const url: string = `${DIGITALOCEAN_API_URL}/${vpsAccount.vps_id}/actions`;
  // try {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${vpsAccount.vps_account?.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "power_on",
    }),
  });
  const data = (await response.json()) as VpsPowerOff;
  if (data) {
    return {
      action_id: data.action.id,
      status: data.action.status,
      type: data.action.type,
      started_at: data.action.started_at,
      completed_at: data.action.completed_at,
    };
  } else {
    return { status: "500", message: "VPS power off failed" };
  }
  // } catch (error: any) {
  // console.log(error);/
  // }
};

export const vps_action_status = async (
  action_id: number,
  vpsAccount: VpsAccount
) => {
  const url = `${DIGITALOCEAN_ACTION_STATUS_URL}/${action_id}`;
  // try {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${vpsAccount.vps_account?.access_token}`,
    },
  });
  const data = (await response.json()) as ActionStatus;
  if (data) {
    // console.log(data);
    return {
      action_id: data.action.id,
      status: data.action.status,
      type: data.action.type,
      started_at: data.action.started_at,
      completed_at: data.action.completed_at,
      resource_id: data.action.resource_id,
    };
  } else {
    return { status: "500", message: "VPS action status fetch failed" };
  }
  // } catch (error: any) {
  // console.log(error);
  // }
};

//   const response = await fetch("https://api.digitalocean.com/v2/droplets", {
//     method: "POST",
//     headers: {
//         "Content-Type": "application/json",
//         Authorization: "Bearer YOUR_DIGITALOCEAN_API_KEY",
//     },
//     body: JSON.stringify({
//         name: "my-droplet",
//         region: "nyc3",
//         size: "s-1vcpu-1gb",
//         image: "ubuntu-20-04-x64",
//         ssh_keys: ["YOUR_SSH_KEY_FINGERPRINT"],
//         backups: false,
//         ipv6: false,
//         monitoring: true,
//         tags: ["web"],
//     }),
// });
// const data = await response.json();
// if (response.ok) {
//     // Droplet creation successful
//     console.log("Droplet created:", data.droplet);
// } else {
//     // Error occurred
//     console.log("Error creating droplet:", data.message);
// }
