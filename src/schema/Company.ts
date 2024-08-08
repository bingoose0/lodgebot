import { model, ObjectId, Schema } from "mongoose";

export enum CompanyRole {
    MEMBER = "member",
    OWNER = "owner"
}

export interface CompanyMember {
    accountId: ObjectId;
    role: CompanyRole;                                                                                                                                                                                                                                                                                                    
}

export interface ICompany {
    balance: number;
    name: string;
    ownerID: ObjectId;
    members: CompanyMember[];
};

const schema = new Schema<ICompany>({
    balance: { type: Number, default: 0 },
    name: { type: String, required: true },
    ownerID: Schema.Types.ObjectId,
    members: [{ 
        accountId: { type: Schema.Types.ObjectId, required: true },
        role: { type: String, enum: [ "member", "owner" ] }
    }]
});

const Company = model<ICompany>("Company", schema);
export default Company;