// Tagalog Trainer v5 — Cloudflare Worker for ElevenLabs
//
// Secrets:
//   ELEVENLABS_API_KEY
//   APP_TOKEN
//
// Variable:
//   ALLOWED_ORIGIN  e.g. https://YOURNAME.github.io

const MODELS=new Set(['eleven_multilingual_v2','eleven_flash_v2_5']);

function cors(origin,allowed){return {
  'Access-Control-Allow-Origin':origin===allowed?origin:allowed,
  'Vary':'Origin',
  'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers':'Content-Type, X-Tagalog-Token',
  'Access-Control-Max-Age':'86400'
}}
function json(data,status,headers={}){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8',...headers}})}
function authOrigin(request,env){const origin=request.headers.get('Origin')||'',allowed=(env.ALLOWED_ORIGIN||'').replace(/\/$/,'');return {origin,allowed,ok:!!allowed&&origin===allowed}}
async function eleven(path,env,init={}){return fetch(`https://api.elevenlabs.io${path}`,{...init,headers:{'xi-api-key':env.ELEVENLABS_API_KEY,...(init.headers||{})}})}

export default {async fetch(request,env){
  const url=new URL(request.url),{origin,allowed,ok}=authOrigin(request,env);

  if(request.method==='OPTIONS'){
    if(!ok)return new Response(null,{status:403});
    return new Response(null,{status:204,headers:cors(origin,allowed)});
  }
  if(!ok)return json({error:'Origin not allowed'},403,cors(origin,allowed));
  if(!env.APP_TOKEN||request.headers.get('X-Tagalog-Token')!==env.APP_TOKEN)return json({error:'Invalid app token'},401,cors(origin,allowed));
  if(!env.ELEVENLABS_API_KEY)return json({error:'ELEVENLABS_API_KEY is not configured in the Worker'},500,cors(origin,allowed));

  if(url.pathname==='/health'&&request.method==='GET')return json({ok:true,provider:'ElevenLabs'},200,cors(origin,allowed));

  if(url.pathname==='/voices'&&request.method==='GET'){
    const r=await eleven('/v2/voices?page_size=100&include_total_count=false',env,{method:'GET',headers:{'Accept':'application/json'}});
    let data=null;try{data=await r.json()}catch{}
    if(!r.ok){
      console.error('ElevenLabs voices error',r.status,JSON.stringify(data||{}).slice(0,700));
      return json({error:`Could not load ElevenLabs voices (${r.status})`},502,cors(origin,allowed));
    }
    const voices=(data?.voices||[]).map(v=>({
      voice_id:v.voice_id,
      name:v.name,
      category:v.category,
      description:v.description||'',
      labels:v.labels||{},
      verified_languages:v.verified_languages||[]
    }));
    return json({voices},200,cors(origin,allowed));
  }

  if(url.pathname==='/speak'&&request.method==='POST'){
    let body;try{body=await request.json()}catch{return json({error:'Invalid JSON'},400,cors(origin,allowed))}
    const text=String(body.text||'').trim();
    const voiceId=String(body.voiceId||'').trim();
    const model=MODELS.has(body.model)?body.model:'eleven_multilingual_v2';
    const learnerSlow=body.learnerSlow===true;
    const speed=learnerSlow?0.70:Math.max(0.70,Math.min(1.20,Number(body.speed)||0.90));

    if(!text||text.length>240)return json({error:'Phrase must be between 1 and 240 characters'},400,cors(origin,allowed));
    if(!/^[A-Za-z0-9_-]{8,80}$/.test(voiceId))return json({error:'Invalid ElevenLabs voice ID'},400,cors(origin,allowed));

    const r=await eleven(`/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,env,{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'audio/mpeg'},
      body:JSON.stringify({
        text,
        model_id:model,
        voice_settings:{
          speed,
          stability:0.55,
          similarity_boost:0.80,
          style:0.05,
          use_speaker_boost:true
        }
      })
    });

    if(!r.ok){
      let detail='';try{detail=await r.text()}catch{}
      console.error('ElevenLabs TTS error',r.status,detail.slice(0,700));
      let message=`ElevenLabs voice generation failed (${r.status})`;
      if(r.status===401)message='ElevenLabs API key is invalid or not authorised';
      if(r.status===429)message='ElevenLabs free credits or request limit reached';
      if(r.status===400||r.status===422)message='That voice/model combination could not generate this phrase';
      return json({error:message},502,cors(origin,allowed));
    }

    return new Response(r.body,{status:200,headers:{'Content-Type':'audio/mpeg','Cache-Control':'private, max-age=86400',...cors(origin,allowed)}});
  }

  return new Response('Not found',{status:404,headers:cors(origin,allowed)});
}};
