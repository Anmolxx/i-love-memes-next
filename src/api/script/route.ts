import { NextResponse } from "next/server";

export async function GET() {
  try {
    const shop = process.env.SHOPIFY_DOMAIN; // yourstore.myshopify.com
    const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
    const graphqlEndpoint = `${shop}/admin/api/2024-01/graphql.json`;

    const mutation = `
      mutation ScriptTagCreate($input: ScriptTagInput!) {
        scriptTagCreate(input: $input) {
          scriptTag {
            id
            src
            displayScope
            createdAt
            updatedAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        src: `${process.env.NEXT_PUBLIC_API_SERVER}/widget.js`, 
        displayScope: "ONLINE_STORE",
        cache: true,
      },
    };

    const response = await fetch(graphqlEndpoint, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": token!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    });

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error("ScriptTag Error:", error);
    return NextResponse.json(
      { error: "Failed to create ScriptTag" },
      { status: 500 }
    );
  }
}
