export interface PIC {
  id: number;
  main_task: string;
  pic_id: number;
  row_id: number;
}

export const picSchema = {
  type: "object",
  required: ["main_task", "pic_id", "row_id"],
  properties: {
    main_task: { type: "string" },
    pic_id: { type: "number" },
    row_id: { type: "number" },
  },
};
