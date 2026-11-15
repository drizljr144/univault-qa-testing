"use client";
import {useMemo,useState} from "react";
type Item={id:string;phase:string;title:string;expected:string;breaks:string};
const phases=[
{n:"01",name:"Google Drive structure & indexing",items:[
["Confirm Drive folder structure is detected","Sync/report identifies the expected academic folders and hierarchy.","Missing folders, duplicate paths, inaccessible folders."],
["Check course folders are indexed","All intended course folders appear in the index.","Folder names parsed incorrectly; empty folders skipped."],
["Check PDF files are indexed","Valid PDFs appear with correct title/path metadata.","PDFs omitted, duplicate records, wrong names."],
["Check non-PDF files are handled","Non-PDF content is skipped or handled according to spec.","Unsupported files crash indexing."],
["Check empty folders","Empty folders don't break sync.","Null/empty directory errors."],
["Check duplicate files","Duplicates are identified or safely represented.","Duplicate entries inflate lists."],
["Check malformed filenames","Odd punctuation/spaces don't break indexing.","Encoding or path parsing issues."],
["Check inaccessible Drive item","Sync reports/handles permission errors.","One denied item aborts whole sync."],
["Check folder IDs and links","Stored links resolve to the right Drive item.","Incorrect IDs or broken links."],
["Check pagination/large folder","All items are retrieved beyond one API page.","Only first page indexed."],
["Check indexing logs","Logs show useful counts and errors.","Silent failures or misleading counts."],
["Check sync repeat","Repeated sync doesn't create unwanted duplicates.","Duplicate database records."],
["Check results/private files exclusion","Student result/private files never enter public library.","Sensitive file exposed in student catalog."]
]},
{n:"02",name:"Academic categorisation",items:[
["Check level categorisation","Resources are under correct level (100/200/300/400).","Wrong level or uncategorised records."],
["Check semester categorisation","Resources map to first or second semester.","Semester absent or incorrect."],
["Check course code matching","Course codes match official course names.","Case/spacing variants create duplicates."],
["Check carryover course handling","Carryover is mapped to its correct level/semester.","Carryover wrongly moved or omitted."],
["Check course with multiple resources","All relevant PDFs appear under the course.","Only one file displayed."],
["Check unknown course","Unknown course is flagged or safely handled.","Crash or silently misclassified."],
["Check course title display","Readable title and course code are shown.","Raw folder path displayed."],
["Check resource counts","Counts match indexed records.","Count stale or inaccurate."],
["Check level/semester filters","Filters return only matching resources.","Cross-semester leakage."]
]},
{n:"03",name:"Student-facing PDF experience",items:[
["Open /pdfs","Student receives the PDF library entry point.","No response or wrong menu."],
["Browse level","Correct level choices appear.","Missing/duplicate level buttons."],
["Browse semester","First/second semester choices appear.","Semester buttons swapped or absent."],
["Browse course","Course list is correct for selected semester.","Courses from other semester leak."],
["Browse resources","Correct PDFs and titles appear.","Wrong files or blank labels."],
["Navigate back","Back returns to previous selection.","State resets or wrong parent."],
["No resources case","Helpful empty-state message appears.","Blank page or traceback."],
["Invalid selection","Bot handles stale/invalid callback safely.","Crash or stuck spinner."],
["Repeated navigation","Repeated browsing remains responsive.","Duplicate messages or state corruption."],
["Long course/resource names","Names remain readable and buttons valid.","Truncation/callback overflow."],
["Unauthorized user","Expected access restriction/response occurs.","Private content exposed."]
]},
{n:"04",name:"PDF delivery",items:[
["Download a small PDF (<50 MB)","PDF arrives intact and opens.","Wrong file, corrupt output, timeout."],
["Download a large PDF (>50 MB)","Clear size-limit message; no upload attempt.","Bot crashes or misleading success."],
["Check 80 MB PDF edge case","Explicit 78.1 MB / 50 MB limit response is expected.","Unexpected upload attempt or generic error."],
["Download near-limit PDF","File within Telegram limit is delivered or failure explained.","Size calculation inaccurate."],
["Check filename","Delivered file has a useful name.","Missing extension or generic name."],
["Check PDF integrity","Downloaded file opens and page count matches.","Truncated or corrupt PDF."],
["Check download timeout","Timeout is handled and user can retry.","Bot hangs."],
["Check missing Drive file","Clear unavailable-file message.","Traceback or dead button."],
["Check repeated download","Second download works.","One-time URL or stale callback."]
]},
{n:"05",name:"Admin functionality",items:[
["Admin verification","Admin can verify eligible student as intended.","Unauthorized user gains admin action."],
["Remove student","Admin removal updates paid/verified list.","Record remains or wrong student removed."],
["Admin PDF upload flow","Course title/file flow confirms and saves correctly.","No confirmation, bad metadata, duplicate entry."],
["Duplicate PDF upload","Duplicate is detected or handled predictably.","Duplicate catalog entries."],
["Invalid admin input","Validation message explains correction.","Crash or silent rejection."],
["Admin command access","Non-admin cannot execute admin commands.","Privilege escalation."],
["Admin feedback","Successful actions provide clear confirmation.","Action happens without feedback."],
["Admin error handling","Failed operation explains failure.","False success or traceback."],
["Paid-student lookup","Matric number match is exact and consistent.","Whitespace/case causes false match."],
["Student record privacy","Admin data isn't exposed to ordinary users.","Student list leaked."]
]},
{n:"06",name:"Automatic synchronisation & reliability",items:[
["Run initial sync","Expected items import and summary is accurate.","Partial sync reported as success."],
["Run repeat sync","No duplicate records or unexpected changes.","Duplication on each run."],
["Drive API/network failure","Sync fails gracefully and preserves usable data.","Data wiped or process crashes."],
["MongoDB unavailable","Bot reports/handles DB failure safely.","Unhandled exception."],
["Telegram API timeout","Bot retries or reports transient failure.","Hung polling or lost process."],
["Partial Drive outage","Accessible folders still process where designed.","Whole sync stops unnecessarily."],
["Check sync duration","Completes in reasonable time and logs duration.","Unexpected slowdown."],
["Check sync counts","Added/updated/skipped/failed totals make sense.","Counts don't reconcile."],
["Check stale deleted file","Removed file is handled according to intended policy.","Dead link remains without warning."],
["Check sync scheduling","Scheduled run occurs at configured interval.","No run or overlapping jobs."],
["Check process recovery","Restart returns bot to normal operation.","State corruption after restart."]
]},
{n:"07",name:"Final verification, GitHub & deployment",items:[
["Verify configuration/secrets","Secrets are environment variables and absent from Git.","Credentials committed/logged."],
["Verify requirements","Dependencies install cleanly from requirements file.","Missing/pinned incompatible package."],
["Verify clean startup","Bot starts without traceback.","Import/configuration error."],
["Verify Git branch/PR","Changes are on intended branch and reviewable.","Wrong branch or uncommitted files."],
["Verify production environment","Required env vars are set on host.","Missing runtime config."],
["Verify hosted bot","Hosted bot responds to basic commands.","Polling/webhook conflict or offline."],
["Verify restart behavior","Host restart restores bot automatically.","Manual restart needed."],
["Verify logs","Logs accessible and no repeated fatal errors.","Hidden failures."],
["Verify user journey end-to-end","Student can browse and receive a valid PDF.","Broken step across workflow."],
["Final tester notes","Remaining blockers and recommendations are recorded.","Unclear severity or missing reproduction."]
]}] as const;
const all:Item[]=phases.flatMap(p=>p.items.map((x,i)=>({id:p.n+"-"+i,phase:p.name,title:x[0],expected:x[1],breaks:x[2]})));
export default function Home(){
 const [tester,setTester]=useState("");const [date,setDate]=useState(new Date().toISOString().slice(0,10));const [environment,setEnvironment]=useState("Local / Windows");const [branch,setBranch]=useState("");const [commit,setCommit]=useState("");
 const [checks,setChecks]=useState<Record<string,{status:string;severity:string;notes:string}>>({});
 const [feedback,setFeedback]=useState("");const [privateNotes,setPrivateNotes]=useState("");
 const [busy,setBusy]=useState(false);const [msg,setMsg]=useState("");const [mode,setMode]=useState<"test"|"admin">("test");const [password,setPassword]=useState("");const [logged,setLogged]=useState(false);const [reports,setReports]=useState<any[]>([]);
 const done=all.filter(x=>checks[x.id]?.status==="Pass"||checks[x.id]?.status==="Fail"||checks[x.id]?.status==="Blocked"||checks[x.id]?.status==="N/A").length;
 const passed=all.filter(x=>checks[x.id]?.status==="Pass").length;const failed=all.filter(x=>checks[x.id]?.status==="Fail").length;
 const grouped=useMemo(()=>phases.map(p=>({...p,items:all.filter(x=>x.phase===p.name)})),[]);
 function exportTxt(){const out=[ "UNIVAULT QA TEST REPORT",`Tester: ${tester}`, `Date: ${date}`,`Environment: ${environment}`,`Branch: ${branch}`,`Commit: ${commit}`,`Progress: ${done}/${all.length}`, `Pass: ${passed} | Fail: ${failed}`,"",...grouped.flatMap(p=>[p.name,...p.items.map(x=>{const c=checks[x.id]||{};return `[${c.status||"Not tested"}] ${x.title}\nExpected: ${x.expected}\nCommon issues: ${x.breaks}\nSeverity: ${c.severity||"—"}\nNotes: ${c.notes||"—"}`} )]),"", "GENERAL FEEDBACK",feedback,"PRIVATE NOTES",privateNotes].join("\n");
 const blob=new Blob([out],{type:"text/plain"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`UniVault-QA-${tester.trim().replace(/[^a-z0-9-]+/gi,"-")||"tester"}-${date}.txt`;a.click();URL.revokeObjectURL(a.href);return out;}
 async function submit(){if(!tester.trim()){setMsg("Enter your tester name first.");return;}setBusy(true);setMsg("");try{const r=await fetch("/api/reports",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({tester,date,environment,branch,commit,checks,feedback,privateNotes,progress:{done,total:all.length,passed,failed}})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Submission failed");setMsg("Report submitted to the QA database. You can also download a TXT copy.");}catch(e:any){setMsg("Could not submit online: "+e.message+" — use Download TXT and send it to the project owner.");}finally{setBusy(false);}}
 async function login(){const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});if(r.ok){setLogged(true);loadReports();}else setMsg("Incorrect password or admin configuration missing.");}
 async function loadReports(){const r=await fetch("/api/admin/reports");if(r.ok)setReports((await r.json()).reports||[]);}
 async function logout(){await fetch("/api/admin/logout",{method:"POST"});setLogged(false);setReports([]);}
 return <main className="shell"><header className="top"><div className="brand"><span className="mark">UV</span><div><b>UniVault</b><small>QUALITY ASSURANCE LAB</small></div></div><button className="ghost" onClick={()=>{setMode(mode==="test"?"admin":"test");setMsg("");}}> {mode==="test"?"Admin dashboard":"Tester portal"} ↗</button></header>
 {mode==="test"?<><section className="hero"><div className="eyebrow">TESTER WORKSPACE · V1</div><h1>Help us make UniVault<br/><em>solid before launch.</em></h1><p>Run the checks below, record what happened, and submit your report directly to the QA database.</p><div className="stats"><div><strong>{done}<small> / {all.length}</small></strong><span>Checks completed</span></div><div><strong>{passed}</strong><span>Passed</span></div><div><strong className={failed?"red":""}>{failed}</strong><span>Failed</span></div><div><strong>{Math.round(done/all.length*100)}%</strong><span>Progress</span></div></div><div className="bar"><i style={{width:done/all.length*100+"%"}}/></div></section>
 <section className="panel"><h2>Test session details</h2><div className="formgrid"><label>Tester name<input value={tester} onChange={e=>setTester(e.target.value)} placeholder="Your name"/></label><label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Environment<select value={environment} onChange={e=>setEnvironment(e.target.value)}><option>Local / Windows</option><option>Hosted / production</option><option>Local / Linux</option><option>Other</option></select></label><label>Git branch<input value={branch} onChange={e=>setBranch(e.target.value)} placeholder="feature/google-drive-pdf-sync"/></label><label className="wide">Commit SHA (optional)<input value={commit} onChange={e=>setCommit(e.target.value} placeholder="Short SHA"/></label></div></section>
 {grouped.map((p,idx)=><section className="phase" key={p.n}><div className="phasehead"><span>{p.n}</span><div><h2>{p.name}</h2><small>{p.items.filter(x=>checks[x.id]?.status).length}/{p.items.length} recorded</small></div></div>{p.items.map((x,i)=>{const c=checks[x.id]||{status:"",severity:"",notes:""};return <article className="test" key={x.id}><div className="testtitle"><b>{idx+1}.{i+1} {x.title}</b><select className={"status "+(c.status||"")} value={c.status} onChange={e=>setChecks(v=>({...v,[x.id]:{...c,status:e.target.value}}))}><option value="">Not tested</option><option>Pass</option><option>Fail</option><option>Blocked</option><option>N/A</option></select></div><details><summary>Expected result & likely failure points</summary><p><strong>Expected:</strong> {x.expected}</p><p><strong>Watch for:</strong> {x.breaks}</p></details>{c.status==="Fail"||c.status==="Blocked"?<div className="issuefields"><label>Severity<select value={c.severity} onChange={e=>setChecks(v=>({...v,[x.id]:{...c,severity:e.target.value}}))}><option value="">Select</option><option>Critical</option><option>High</option><option>Medium</option><option>Low</option></select></label><label className="grow">What happened?<input value={c.notes} onChange={e=>setChecks(v=>({...v,[x.id]:{...c,notes:e.target.value}}))} placeholder="Steps, actual result, error message…"/></label></div>:c.status==="Pass"?<label className="notes">Optional note<input value={c.notes} onChange={e=>setChecks(v=>({...v,[x.id]:{...c,notes:e.target.value}}))} placeholder="Anything worth noting"/></label>:null}</article>})}</section>)}
 <section className="panel"><h2>Wrap-up</h2><label>General feedback<textarea rows={4} value={feedback} onChange={e=>setFeedback(e.target.value)} placeholder="Overall experience, confusing flows, suggestions…"/></label><label>Private notes for owner<textarea rows={3} value={privateNotes} onChange={e=>setPrivateNotes(e.target.value)} placeholder="Anything you want to tell the project owner privately…"/></label><div className="actions"><button onClick={exportTxt} className="secondary">↓ Download TXT</button><button onClick={submit} disabled={busy} className="primary">{busy?"Submitting…":"Submit report online →"}</button></div>{msg&&<p className="message">{msg}</p>}<p className="fine">Online submission stores this report for the project owner. Download TXT as a backup.</p></section></>:<section className="panel admin"><h1>Owner dashboard</h1>{!logged?<><p>Sign in to view tester submissions. This area is private.</p><label>Admin password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/></label><button className="primary" onClick={login}>Sign in</button>{msg&&<p className="message">{msg}</p>}</>:<><div className="actions"><button className="secondary" onClick={loadReports}>↻ Refresh</button><button className="ghost" onClick={logout}>Sign out</button></div><h2>{reports.length} submitted reports</h2>{reports.length===0?<p>No reports submitted yet.</p>:reports.map(r=><details className="report" key={r._id}><summary><b>{r.tester}</b> · {r.date} · {r.progress?.passed||0} pass / {r.progress?.failed||0} fail</summary><p>{r.environment} · {r.branch||"branch unspecified"} · {r.commit||"no SHA"}</p><p>{r.feedback}</p><pre>{JSON.stringify(r.checks,null,2)}</pre><button className="secondary" onClick={()=>{const b=new Blob([JSON.stringify(r,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=`QA-${r.tester}-${r.date}.json`;a.click();}}>Export JSON</button></details>)}</>}</section>}
 <footer>UNIVAULT QA · PRIVATE TESTING · REPORT ISSUES HONESTLY</footer></main>;
}