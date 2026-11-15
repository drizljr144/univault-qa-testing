import {NextResponse} from "next/server";
import {db} from "@/lib/db";
export const runtime="nodejs";
const statuses=new Set(["Pass","Fail","Blocked","N/A"]);
export async function POST(req:Request){
 try{
  const body=await req.json();
  if(typeof body.tester!=="string"||!body.tester.trim()||body.tester.length>100) return NextResponse.json({error:"Tester name is required (max 100 characters)."}, {status:400});
  if(typeof body.date!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(body.date))return NextResponse.json({error:"Valid test date required."},{status:400});
  if(!body.checks||typeof body.checks!=="object"||Array.isArray(body.checks))return NextResponse.json({error:"Checks payload is invalid."},{status:400});
  const entries=Object.entries(body.checks as Record<string,any>);
  if(entries.length>100)return NextResponse.json({error:"Too many check records."},{status:400});
  const checks:Record<string,any>={};
  for(const [id,c] of entries){if(!/^\d{2}-\d+$/.test(id)||!c||typeof c!=="object")continue;checks[id]={status:statuses.has(c.status)?c.status:"",severity:["Critical","High","Medium","Low"].includes(c.severity)?c.severity:"",notes:typeof c.notes==="string"?c.notes.slice(0,2000):""};}
  const report={tester:body.tester.trim(),date:body.date,environment:String(body.environment||"").slice(0,100),branch:String(body.branch||"").slice(0,200),commit:String(body.commit||"").slice(0,100),checks,feedback:String(body.feedback||"").slice(0,5000),privateNotes:String(body.privateNotes||"").slice(0,5000),progress:{done:Number(body.progress?.done)||0,total:73,passed:Number(body.progress?.passed)||0,failed:Number(body.progress?.failed)||0},createdAt:new Date(),userAgent:req.headers.get("user-agent")?.slice(0,300)||""};
  const result=await (await db()).collection("reports").insertOne(report);
  return NextResponse.json({ok:true,id:result.insertedId.toString()},{status:201});
 }catch(e){console.error("QA report submission failed",e);return NextResponse.json({error:"Database unavailable or report could not be saved."},{status:500});}
}