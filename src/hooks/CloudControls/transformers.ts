import { Instance, Balance, InstanceListResponse, BalanceResponse } from './base';

// Chenyu API Response Types
interface ChenyuInstance {
  id: string;
  name: string;
  status: string;
  // ... other Chenyu specific fields
}

interface ChenyuBalanceResponse {
  code: string;
  msg: string;
  result: {
    cards: Array<{
      id: string;
      name: string;
      balance: number;
    }>;
    balance: number;
  };
}

interface ChenyuInstanceResponse {
  code: string;
  msg: string;
  result: {
    instances: ChenyuInstance[];
    total: number;
  };
}

// Xiangong API Response Types
interface XiangongInstance {
  id: string;
  create_timestamp: number;
  data_center_name: string;
  name: string;
  public_image: string;
  gpu_model: string;
  gpu_used: number;
  cpu_model: string;
  cpu_core_count: number;
  memory_size: number;
  system_disk_size: number;
  data_disk_size: number;
  expandable_data_disk_size: number;
  data_disk_mount_path: string;
  storage_mount_path: string;
  price_per_hour: number;
  ssh_key: string;
  ssh_port: string;
  ssh_user: string;
  password: string;
  jupyter_token: string;
  jupyter_url: string;
  xgcos_token: string;
  xgcos_url: string;
  start_timestamp: number;
  stop_timestamp: number;
  status: string;
  ssh_domain: string;
  web_url: string;
  progress: number;
  image_id: string;
  image_type: string;
  image_price: number;
  image_save: boolean;
  base_price: number;
  retain: number;
  retain_price: number;
  retain_size: number;
}

interface XiangongInstanceListResponse {
  list: XiangongInstance[];
  total: number;
}

interface XiangongBalanceResponse {
  balance: number;
}

// Chenyu Transformers
export const chenyuTransformers = {
  instances: (data: ChenyuInstanceResponse): InstanceListResponse => {
    return {
      list: data.result.instances.map(instance => ({
        id: instance.id,
        name: instance.name,
        status: instance.status,
        // Map other fields as needed
      })),
      total: data.result.total,
    };
  },

  balance: (data: ChenyuBalanceResponse): BalanceResponse => {
    return {
      balance: data.result.balance,
      cards: data.result.cards.map(card => ({
        id: card.id,
        name: card.name,
        balance: card.balance,
      })),
    };
  },
};

// Xiangong Transformers
export const xiangongTransformers = {
  instances: (data: XiangongInstanceListResponse): InstanceListResponse => {
    return {
      list: data.list.map(instance => ({
        id: instance.id,
        name: instance.name,
        status: instance.status,
        gpu_model: instance.gpu_model,
        gpu_used: instance.gpu_used,
        cpu_model: instance.cpu_model,
        cpu_core_count: instance.cpu_core_count,
        memory_size: instance.memory_size,
        system_disk_size: instance.system_disk_size,
        data_disk_size: instance.data_disk_size,
        price_per_hour: instance.price_per_hour,
        ssh_port: instance.ssh_port,
        ssh_user: instance.ssh_user,
        password: instance.password,
        web_url: instance.web_url,
        start_timestamp: instance.start_timestamp,
        stop_timestamp: instance.stop_timestamp,
        create_timestamp: instance.create_timestamp,
        data_center_name: instance.data_center_name,
        public_image: instance.public_image,
        expandable_data_disk_size: instance.expandable_data_disk_size,
        data_disk_mount_path: instance.data_disk_mount_path,
        storage_mount_path: instance.storage_mount_path,
        ssh_key: instance.ssh_key,
        jupyter_token: instance.jupyter_token,
        jupyter_url: instance.jupyter_url,
        xgcos_token: instance.xgcos_token,
        xgcos_url: instance.xgcos_url,
        progress: instance.progress,
        image_id: instance.image_id,
        image_type: instance.image_type,
        image_price: instance.image_price,
        image_save: instance.image_save,
        base_price: instance.base_price,
        retain: instance.retain,
        retain_price: instance.retain_price,
        retain_size: instance.retain_size,
        ssh_domain: instance.ssh_domain,
      })),
      total: data.total,
    };
  },

  balance: (data: XiangongBalanceResponse): BalanceResponse => {
    return {
      balance: data.balance,
      cards: [], // Xiangong doesn't have cards
    };
  },
}; 