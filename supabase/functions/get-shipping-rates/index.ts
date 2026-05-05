import { serve } from "std/server";

interface ShippingRequest {
  cep: string;
}

interface MelhorEnviosRate {
  id: number;
  price: number;
  name: string;
  delivery_days: number;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { cep } = await req.json() as ShippingRequest;
    const token = Deno.env.get('MELHOR_ENVIOS_TOKEN');

    if (!token) {
      return new Response(
        JSON.stringify({ error: "API Token not configured on server" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Melhor Envios expects a specific payload for calculation
    // In a real scenario, we'd calculate total weight/dims of the cart items.
    // For this demo, we use a standard package (10x10x10cm, 500g)
    const payload = {
      from: {
        zipcode: "01001-000", // Origin ZIP (replace with your actual store ZIP)
        weight_max: 30,
        width_max: 100,
          height_max: 100,
          length_max: 100,
      },
      to: {
        zipcode: cep,
      },
      products: [
        {
          weight: 0.5,
          width: 10,
          height: 10,
          length: 10,
          quantity: 1
        }
      ]
    };

    const response = await fetch("https://www.melhorenvios.com.br/api/v2/shipping/calculate", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.message || "Erro na API do Melhor Envios" }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Extract the cheapest rate
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("Nenhuma opção de frete encontrada.");
    }

    const rates = data as MelhorEnviosRate[];
    const cheapest = rates.reduce((prev, curr) => {
      return prev.price < curr.price ? prev : curr;
    });

    return new Response(
      JSON.stringify({ 
        rate: cheapest.price,
        delivery_days: cheapest.delivery_days,
        carrier: cheapest.name
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Shipping Error:", error);
    const message = error instanceof Error ? error.message : "Erro interno ao processar frete";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// Invoke the serve function to start the server (Deno requirement)
serve(handler);
