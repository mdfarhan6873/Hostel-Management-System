export type Role = "superadmin" | "warden" | "student";

export type StudentStatus = "WAITING" | "ALLOTTED" | "CANCELLED";

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  mobile: string;
  password?: string;
  role: "superadmin" | "warden";
  assignedCategory?: string; // e.g. "Boys Hostel" | "Girls Hostel"
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IParents {
  fatherName: string;
  motherName: string;
  parentMobile: string;
}

export interface IDocumentLink {
  title: string;
  url: string;
}

export interface IStudent {
  _id?: string;
  fullName: string;
  email: string;
  mobile: string;
  password?: string;
  age: number;
  completeAddress: string;
  bloodGroup?: string;

  // Academic Details
  rollNo: string;
  branch: string;
  session: string; // e.g. "2025-2029"
  registrationNo?: string;

  // Hostel & Documents
  messCardNo?: string;
  documentLinks?: IDocumentLink[];

  // Parents Details
  parents: IParents;

  // Lifecycle Status
  status: StudentStatus;

  // Allocated Infrastructure Details
  hostelId?: any;
  blockId?: any;
  floorId?: any;
  roomId?: any;
  furnitureGroupName?: string;
  assignedBedId?: string;
  assignedTableId?: string;
  assignedChairId?: string;

  // Eviction / Removal Notice
  evictionRemark?: string;
  evictionNoticeLink?: string;
  evictedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFurnitureGroup {
  groupName: string; // e.g. "Group A", "Group B"
  bedId?: string;    // e.g. "BED-101-A"
  tableId?: string;  // e.g. "TAB-101-A"
  chairId?: string;  // e.g. "CHR-101-A"
  isOccupied?: boolean;
  occupiedBy?: any; // studentId
  occupiedStudentName?: string;
  occupiedStudentRoll?: string;
  occupiedStudentBranch?: string;
  occupiedStudentSession?: string;
}

export interface IRoom {
  _id?: any;
  roomNumber: string;
  floorId: any;
  blockId: any;
  hostelId: any;
  capacity: number; // 1, 2, 3
  roomType: "Single" | "Double" | "Triple" | string;
  furnitureGroups: IFurnitureGroup[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFloor {
  _id?: any;
  name: string; // e.g. "Ground Floor", "1st Floor"
  floorNumber: number;
  blockId: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBlock {
  _id?: any;
  name: string; // e.g. "Block A", "Block B"
  hostelId: any;
  wardenId?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IHostel {
  _id?: any;
  name: string; // e.g. "Boys Hostel", "Girls Hostel"
  type: "boys" | "girls" | string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBill {
  _id?: any;
  studentId: any;
  wardenId: any;
  title: string;
  billType: "mess" | "rent" | "maintenance" | "fine" | string;
  billingPeriod: string; // e.g. "August 2026" or "Jan-July 2026"
  baseAmount: number;
  leaveDaysRebate: number;
  rebateAmount: number;
  netAmount: number;
  dueDate: Date;
  status: "PENDING" | "PAID";
  paidAt?: Date;
  receiptNumber?: string;
  transactionId?: string;
  paymentMethod?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILeaveRequest {
  _id?: any;
  studentId: any;
  startDate: Date;
  endDate: Date;
  daysCount: number;
  reason: string;
  handwrittenApplicationUrl?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedBy?: any;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAdmissionNotice {
  _id?: string;
  title: string;
  description: string;
  category: "ADMISSION" | "CIRCULAR" | "BLUEPRINT" | "REBATE";
  refNumber: string;
  publishDate: Date;
  pdfLinks: { label: string; url: string }[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
