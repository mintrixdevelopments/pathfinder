"use client";

import { useState } from "react";

export default function Home() {
  const [page, setPage] = useState("Dashboard");
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState("Ready");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([
    "Pathfinder Core initialized",
    "Developer environment loaded",
    "Waiting for build request..."
  ]);

  function build() {
    if (!prompt) {
      setStatus("Enter a build request");
      return;
    }

    setStatus("Planning...");
    setProgress(20);

    setLogs((l) => [
      ...l,
      `User request: ${prompt}`,
      "AI planner started"
    ]);

    setTimeout(() => {
      setProgress(50);
      setStatus("Generating Roblox actions");

      setLogs((l) => [
        ...l,
        "Creating build instructions"
      ]);
    }, 1000);

    setTimeout(() => {
      setProgress(100);
      setStatus("Complete");

      setLogs((l) => [
        ...l,
        "Build plan completed"
      ]);
    }, 2500);
  }


  return (
    <main className="min-h-screen bg-[#070707] text-white flex font-sans">

      <aside className="w-72 border-r border-white/10 p-6">

        <h1 className="text-3xl font-black tracking-tight">
          Pathfinder
        </h1>

        <p className="text-sm text-zinc-500">
          Mintrix Developments
        </p>


        <div className="mt-10 space-y-2">

          {[
            "Dashboard",
            "Projects",
            "AI Engine",
            "Plugin",
            "Settings"
          ].map(item => (

            <button
              key={item}
              onClick={() => setPage(item)}
              className={`w-full text-left px-4 py-3 rounded-xl transition ${
                page === item
                ? "bg-white text-black"
                : "hover:bg-white/10 text-zinc-400"
              }`}
            >
              {item}
            </button>

          ))}

        </div>


        <div className="absolute bottom-6 text-xs text-zinc-600">
          Pathfinder Alpha v0.1
        </div>

      </aside>



      <section className="flex-1 p-10">


        <div className="flex justify-between">

          <div>
            <h2 className="text-5xl font-black">
              {page}
            </h2>

            <p className="text-zinc-400 mt-2">
              AI Roblox development console
            </p>
          </div>


          <div className="bg-yellow-400 text-black px-5 py-2 rounded-full font-bold">
            DEV MODE
          </div>

        </div>



        <div className="grid md:grid-cols-3 gap-5 mt-10">


          <Card title="System">
            <span className="text-green-400">
              ● Online
            </span>
          </Card>


          <Card title="AI Engine">
            <span className="text-yellow-400">
              ● Testing
            </span>
          </Card>


          <Card title="Plugin">
            <span className="text-red-400">
              ● Not Connected
            </span>
          </Card>


        </div>



        <div className="mt-8 bg-white/5 border border-white/10 rounded-3xl p-8">

          <h3 className="text-2xl font-bold">
            Build Request
          </h3>

          <textarea
            className="mt-5 w-full h-40 bg-black border border-white/10 rounded-2xl p-5 outline-none focus:border-white/40"
            placeholder="Build a simulator game with pets..."
            value={prompt}
            onChange={(e)=>setPrompt(e.target.value)}
          />


          <button
            onClick={build}
            className="mt-5 px-8 py-4 rounded-xl bg-white text-black font-bold hover:scale-105 transition"
          >
            Generate Build
          </button>


          <div className="mt-6">

            <p className="text-zinc-400">
              {status}
            </p>


            <div className="mt-3 h-3 bg-black rounded-full overflow-hidden">

              <div
                className="h-full bg-white transition-all"
                style={{
                  width:`${progress}%`
                }}
              />

            </div>

          </div>

        </div>



        <div className="mt-8 bg-black border border-white/10 rounded-3xl p-6 font-mono">

          <h3 className="font-bold mb-4">
            Live Logs
          </h3>

          {logs.map((x,i)=>(
            <p key={i} className="text-zinc-400">
              {">"} {x}
            </p>
          ))}

        </div>


      </section>

    </main>
  );
}



function Card({
 title,
 children
}:{
 title:string;
 children:React.ReactNode;
}){

return (

<div className="bg-white/5 border border-white/10 rounded-2xl p-6">

<p className="text-zinc-400">
{title}
</p>

<div className="mt-3 font-bold">
{children}
</div>

</div>

)

}
