import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from "https://esm.sh/stripe@13.11.0?target=deno"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    })

    const monthly = await stripe.prices.create({
      product: "prod_UyRcxas6h4MzKa",
      unit_amount: 799,
      currency: "eur",
      recurring: { interval: "month" },
      nickname: "Mensuel 7,99\u20ac",
    })

    const yearly = await stripe.prices.create({
      product: "prod_UyRcJODIgWrbQT",
      unit_amount: 6999,
      currency: "eur",
      recurring: { interval: "year" },
      nickname: "Annuel 69,99\u20ac",
    })

    return new Response(JSON.stringify({ monthly: monthly.id, yearly: yearly.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
