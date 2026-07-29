import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get("Authorization")!
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Non autorisé" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const { message, profile, history } = await req.json()

    const systemPrompt = `Tu es NIRIKA, un coach sportif expert. Tu parles français.

Règles :
- Tu réponds en 2-3 phrases max, concis et motivant
- Tu t'adaptes au niveau de l'utilisateur
- Tu ne donnes JAMAIS de conseils médicaux
- Tu recommandes de consulter un médecin pour toute question médicale
- Tu utilises les informations du profil pour personnaliser tes réponses
- Tu es encourageant mais honnête

Profil utilisateur :
- Objectif(s) : ${(profile?.goals || []).join(", ") || "Non défini"}
- Niveau : ${profile?.level || "Non défini"}
- Fréquence : ${profile?.frequency || "Non défini"} jours/semaine
- Âge : ${profile?.age || "Non défini"}
- Poids : ${profile?.weight || "Non défini"} kg
- Taille : ${profile?.height || "Non défini"} cm
- Blessures : ${(profile?.injuries || []).join(", ") || "Aucune"}
- Lieu : ${profile?.location || "Non défini"}
- Matériel : ${(profile?.material || []).join(", ") || "Non défini"}
- Sexe : ${profile?.sex || "Non défini"}
- Sommeil : ${profile?.sleepQuality || "Non défini"}
- Stress : ${profile?.stressLevel || "Non défini"}
- Métier : ${profile?.workType || "Non défini"}`

    const openaiKey = Deno.env.get("OPENAI_API_KEY")
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: "API OpenAI non configurée" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).slice(-10),
      { role: "user", content: message },
    ]

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || "Erreur OpenAI" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ reply: data.choices[0].message.content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
