// import { useEffect } from "react";
// import { useFetcher } from "react-router";
// import { useAppBridge } from "@shopify/app-bridge-react";
// import { boundary } from "@shopify/shopify-app-react-router/server";
// import { authenticate } from "../shopify.server";

// export const loader = async ({ request }) => {
//   await authenticate.admin(request);

//   return null;
// };

// export const action = async ({ request }) => {
//   const { admin } = await authenticate.admin(request);
//   const color = ["Red", "Orange", "Yellow", "Green"][
//     Math.floor(Math.random() * 4)
//   ];
//   const response = await admin.graphql(
//     `#graphql
//       mutation populateProduct($product: ProductCreateInput!) {
//         productCreate(product: $product) {
//           product {
//             id
//             title
//             handle
//             status
//             variants(first: 10) {
//               edges {
//                 node {
//                   id
//                   price
//                   barcode
//                   createdAt
//                 }
//               }
//             }
//             demoInfo: metafield(namespace: "$app", key: "demo_info") {
//               jsonValue
//             }
//           }
//         }
//       }`,
//     {
//       variables: {
//         product: {
//           title: `${color} Snowboard`,
//           metafields: [
//             {
//               namespace: "$app",
//               key: "demo_info",
//               value: "Created by React Router Template",
//             },
//           ],
//         },
//       },
//     },
//   );
//   const responseJson = await response.json();
//   const product = responseJson.data.productCreate.product;
//   const variantId = product.variants.edges[0].node.id;
//   const variantResponse = await admin.graphql(
//     `#graphql
//     mutation shopifyReactRouterTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
//       productVariantsBulkUpdate(productId: $productId, variants: $variants) {
//         productVariants {
//           id
//           price
//           barcode
//           createdAt
//         }
//       }
//     }`,
//     {
//       variables: {
//         productId: product.id,
//         variants: [{ id: variantId, price: "100.00" }],
//       },
//     },
//   );
//   const variantResponseJson = await variantResponse.json();
//   const metaobjectResponse = await admin.graphql(
//     `#graphql
//     mutation shopifyReactRouterTemplateUpsertMetaobject($handle: MetaobjectHandleInput!, $metaobject: MetaobjectUpsertInput!) {
//       metaobjectUpsert(handle: $handle, metaobject: $metaobject) {
//         metaobject {
//           id
//           handle
//           title: field(key: "title") {
//             jsonValue
//           }
//           description: field(key: "description") {
//             jsonValue
//           }
//         }
//         userErrors {
//           field
//           message
//         }
//       }
//     }`,
//     {
//       variables: {
//         handle: {
//           type: "$app:example",
//           handle: "demo-entry",
//         },
//         metaobject: {
//           fields: [
//             { key: "title", value: "Demo Entry" },
//             {
//               key: "description",
//               value:
//                 "This metaobject was created by the Shopify app template to demonstrate the metaobject API.",
//             },
//           ],
//         },
//       },
//     },
//   );
//   const metaobjectResponseJson = await metaobjectResponse.json();

//   return {
//     product: responseJson.data.productCreate.product,
//     variant: variantResponseJson.data.productVariantsBulkUpdate.productVariants,
//     metaobject: metaobjectResponseJson.data.metaobjectUpsert.metaobject,
//   };
// };

// export default function Index() {
//   const fetcher = useFetcher();
//   const shopify = useAppBridge();
//   const isLoading =
//     ["loading", "submitting"].includes(fetcher.state) &&
//     fetcher.formMethod === "POST";

//   useEffect(() => {
//     if (fetcher.data?.product?.id) {
//       shopify.toast.show("Product created");
//     }
//   }, [fetcher.data?.product?.id, shopify]);
//   const generateProduct = () => fetcher.submit({}, { method: "POST" });

//   return (
//     <s-page heading="Shopify app template">
//       <s-button slot="primary-action" onClick={generateProduct}>
//         Generate a product
//       </s-button>

//       <s-section heading="Congrats on creating a new Shopify app 🎉">
//         <s-paragraph>
//           This embedded app template uses{" "}
//           <s-link
//             href="https://shopify.dev/docs/apps/tools/app-bridge"
//             target="_blank"
//           >
//             App Bridge
//           </s-link>{" "}
//           interface examples like an{" "}
//           <s-link href="/app/additional">additional page in the app nav</s-link>
//           , as well as an{" "}
//           <s-link
//             href="https://shopify.dev/docs/api/admin-graphql"
//             target="_blank"
//           >
//             Admin GraphQL
//           </s-link>{" "}
//           mutation demo, to provide a starting point for app development.
//         </s-paragraph>
//       </s-section>
//       <s-section heading="Get started with products">
//         <s-paragraph>
//           Generate a product with GraphQL and get the JSON output for that
//           product. Learn more about the{" "}
//           <s-link
//             href="https://shopify.dev/docs/api/admin-graphql/latest/mutations/productCreate"
//             target="_blank"
//           >
//             productCreate
//           </s-link>{" "}
//           mutation in our API references. Includes a product{" "}
//           <s-link
//             href="https://shopify.dev/docs/apps/build/custom-data/metafields"
//             target="_blank"
//           >
//             metafield
//           </s-link>{" "}
//           and{" "}
//           <s-link
//             href="https://shopify.dev/docs/apps/build/custom-data/metaobjects"
//             target="_blank"
//           >
//             metaobject
//           </s-link>
//           .
//         </s-paragraph>
//         <s-stack direction="inline" gap="base">
//           <s-button
//             onClick={generateProduct}
//             {...(isLoading ? { loading: true } : {})}
//           >
//             Generate a product
//           </s-button>
//           {fetcher.data?.product && (
//             <s-button
//               onClick={() => {
//                 shopify.intents.invoke?.("edit:shopify/Product", {
//                   value: fetcher.data?.product?.id,
//                 });
//               }}
//               target="_blank"
//               variant="tertiary"
//             >
//               Edit product
//             </s-button>
//           )}
//         </s-stack>
//         {fetcher.data?.product && (
//           <s-section heading="productCreate mutation">
//             <s-stack direction="block" gap="base">
//               <s-box
//                 padding="base"
//                 borderWidth="base"
//                 borderRadius="base"
//                 background="subdued"
//               >
//                 <pre style={{ margin: 0 }}>
//                   <code>{JSON.stringify(fetcher.data.product, null, 2)}</code>
//                 </pre>
//               </s-box>

//               <s-heading>productVariantsBulkUpdate mutation</s-heading>
//               <s-box
//                 padding="base"
//                 borderWidth="base"
//                 borderRadius="base"
//                 background="subdued"
//               >
//                 <pre style={{ margin: 0 }}>
//                   <code>{JSON.stringify(fetcher.data.variant, null, 2)}</code>
//                 </pre>
//               </s-box>

//               <s-heading>metaobjectUpsert mutation</s-heading>
//               <s-box
//                 padding="base"
//                 borderWidth="base"
//                 borderRadius="base"
//                 background="subdued"
//               >
//                 <pre style={{ margin: 0 }}>
//                   <code>
//                     {JSON.stringify(fetcher.data.metaobject, null, 2)}
//                   </code>
//                 </pre>
//               </s-box>
//             </s-stack>
//           </s-section>
//         )}
//       </s-section>

//       <s-section slot="aside" heading="App template specs">
//         <s-paragraph>
//           <s-text>Framework: </s-text>
//           <s-link href="https://reactrouter.com/" target="_blank">
//             React Router
//           </s-link>
//         </s-paragraph>
//         <s-paragraph>
//           <s-text>Interface: </s-text>
//           <s-link
//             href="https://shopify.dev/docs/api/app-home/using-polaris-components"
//             target="_blank"
//           >
//             Polaris web components
//           </s-link>
//         </s-paragraph>
//         <s-paragraph>
//           <s-text>API: </s-text>
//           <s-link
//             href="https://shopify.dev/docs/api/admin-graphql"
//             target="_blank"
//           >
//             GraphQL
//           </s-link>
//         </s-paragraph>
//         <s-paragraph>
//           <s-text>Custom data: </s-text>
//           <s-link
//             href="https://shopify.dev/docs/apps/build/custom-data"
//             target="_blank"
//           >
//             Metafields &amp; metaobjects
//           </s-link>
//         </s-paragraph>
//         <s-paragraph>
//           <s-text>Database: </s-text>
//           <s-link href="https://www.prisma.io/" target="_blank">
//             Prisma
//           </s-link>
//         </s-paragraph>
//       </s-section>

//       <s-section slot="aside" heading="Next steps">
//         <s-unordered-list>
//           <s-list-item>
//             Build an{" "}
//             <s-link
//               href="https://shopify.dev/docs/apps/getting-started/build-app-example"
//               target="_blank"
//             >
//               example app
//             </s-link>
//           </s-list-item>
//           <s-list-item>
//             Explore Shopify&apos;s API with{" "}
//             <s-link
//               href="https://shopify.dev/docs/apps/tools/graphiql-admin-api"
//               target="_blank"
//             >
//               GraphiQL
//             </s-link>
//           </s-list-item>
//         </s-unordered-list>
//       </s-section>
//     </s-page>
//   );
// }

// export const headers = (headersArgs) => {
//   return boundary.headers(headersArgs);
// };

// import { useFetcher, useLoaderData } from "react-router";
// import { useAppBridge } from "@shopify/app-bridge-react";
// import { boundary } from "@shopify/shopify-app-react-router/server";
// import { authenticate } from "../shopify.server";
// import { useEffect } from "react";

// export const loader = async ({ request }) => {
//   const { session } = await authenticate.admin(request);
//   try {
//     const response = await fetch(`http://127.0.0.1:8000/api/leads?shop=${session.shop}`);
//     const leads = await response.json();
//     return { leads: Array.isArray(leads) ? leads : [] };
//   } catch (e) {
//     return { leads: [] };
//   }
// };



import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useEffect } from "react";



export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  try {
    // We fetch the data from Laravel
    const response = await fetch(`http://127.0.0.1:8000/api/leads?shop=${session.shop}`);
    const leads = await response.json();
    return { leads: Array.isArray(leads) ? leads : [] };
  } catch (e) {
    return { leads: [] };
  }
};



export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  // Send the new lead to Laravel
  await fetch("http://127.0.0.1:8000/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      shop_domain: session.shop,
      name: data.name,
      email: data.email,
    }),
  });

  // Returning null or a success message triggers the "Loader" to refresh
  return { success: true };
};



export default function Index() {
  const { leads = [] } = useLoaderData();
  const fetcher = useFetcher();

  // Check if the app is currently talking to the server
  const isSaving = fetcher.state !== "idle";

  return (
    <ui-page title="Lead Manager">
      <ui-layout>
        {/* Form Section */}
        <ui-layout-section>
          <s-card>
            <fetcher.Form method="POST">
              <s-block-stack gap="400">
                <s-text variant="headingMd">Add New Lead</s-text>
                <input name="name" placeholder="Name" required style={inputStyle} />
                <input name="email" type="email" placeholder="Email" required style={inputStyle} />
                <button type="submit" disabled={isSaving} style={buttonStyle}>
                  {isSaving ? "Saving..." : "Save Lead"}
                </button>
              </s-block-stack>
            </fetcher.Form>
          </s-card>
        </ui-layout-section>

        {/* List Section (The SPA part) */}
        <ui-layout-section>
          <s-card>
            <s-block-stack gap="200">
              <s-text variant="headingMd">Current Database Leads</s-text>
              {leads.length === 0 ? (
                <p>No leads found.</p>
              ) : (
                leads.map((lead) => (
                  <div key={lead.id} style={listStyle}>
                    <p><strong>{lead.name}</strong> ({lead.email})</p>
                    <s-text variant="bodySm" tone="subdued">{lead.shop_domain}</s-text>
                  </div>
                ))
              )}
            </s-block-stack>
          </s-card>
        </ui-layout-section>
      </ui-layout>
    </ui-page>
  );
}

// Simple styling to keep it clean
const inputStyle = { padding: '8px', marginBottom: '10px', display: 'block', width: '100%' };
const buttonStyle = { backgroundColor: '#008060', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px' };
const listStyle = { padding: '10px', borderBottom: '1px solid #dfe3e8' };