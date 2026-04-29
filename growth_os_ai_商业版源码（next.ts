// GrowthOS AI 商业版（单文件演示版）
// 技术栈: Next.js App Router + Supabase + OpenAI
// 将此内容拆分到真实项目结构即可运行

import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

export const config = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  openaiKey: process.env.OPENAI_API_KEY!,
}

export const supabase = createClient(config.supabaseUrl, config.supabaseKey)
export const openai = new OpenAI({ apiKey: config.openaiKey })

export async function runTrendAgent() {
  return ['小红书夏季穿搭', '德国留学生兼职', 'AI创业工具榜']
}

export async function runContentAgent(topic:string) {
  const res = await openai.responses.create({
    model:'gpt-5',
    input:`围绕主题 ${topic} 生成10条爆款短视频标题`
  })
  return res.output_text
}

export async function runAnalyticsAgent() {
  return {
    visits: 1823,
    conversions: 93,
    roi: '+28%',
    tokenUsed: 1203344
  }
}

export async function createTask(userId:string, topic:string){
  const { data } = await supabase.from('tasks').insert({ user_id:userId, topic, status:'pending' }).select()
  return data
}

export async function fullWorkflow(userId:string){
  const trends = await runTrendAgent()
  const topic = trends[0]
  await createTask(userId, topic)
  const content = await runContentAgent(topic)
  const analytics = await runAnalyticsAgent()
  return { topic, content, analytics }
}

// Next.js page demo
export default async function Page(){
  const data = await fullWorkflow('demo-user')
  return (
    <main style={{padding:40,fontFamily:'sans-serif'}}>
      <h1>GrowthOS AI 控制台</h1>
      <h2>今日热点：{data.topic}</h2>
      <pre>{data.content}</pre>
      <p>访问量：{data.analytics.visits}</p>
      <p>转化数：{data.analytics.conversions}</p>
      <p>ROI：{data.analytics.roi}</p>
      <p>Token消耗：{data.analytics.tokenUsed}</p>
    </main>
  )
}

// SQL:
// create table tasks(id uuid default gen_random_uuid() primary key, user_id text, topic text, status text, created_at timestamp default now());
