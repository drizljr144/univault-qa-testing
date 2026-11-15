import {NextResponse} from "next/server";
import {passwordMatches,setAdminSession} from "@/lib/session";
export async function POST(req:Request){
 try{const {password}=await req.json();if(typeof password!=="string"||!passwordMatches(password))return NextResponse.json({error:"Invalid credentials."},{status:401});await setAdminSession();return NextResponse.json({ok:true});}
 catch(e){console.error("Admin login configuration error",e);return NextResponse.json({error:"Admin authentication is not configured correctly."},{status:500});}
}