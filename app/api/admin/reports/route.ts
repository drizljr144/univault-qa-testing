import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {isAdmin} from "@/lib/session";
export const runtime="nodejs";
export async function GET(){
 if(!await isAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});
 try{const reports=await (await db()).collection("reports").find({}).sort({createdAt:-1}).limit(200).toArray();return NextResponse.json({reports:reports.map(r=>({...r,_id:r._id.toString()}))});}
 catch(e){console.error("Admin report fetch failed",e);return NextResponse.json({error:"Could not load reports."},{status:500});}
}