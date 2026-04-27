import "@shopify/polaris/build/esm/styles.css";
import { useLoaderData, useSearchParams } from "react-router";
import { authenticate } from "../shopify.server";
// 1. Add AppProvider and translations
import { Page, Layout, Card, ResourceList, ResourceItem, Text, Badge, Pagination, AppProvider } from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";

export const loader = async ({ request }) => {
    const { admin } = await authenticate.admin(request);
    const url = new URL(request.url);

    // Get pagination parameters from the URL
  const after = url.searchParams.get("after");
    const before = url.searchParams.get("before");
    

 // Build the query variables
  // If we have 'after', we fetch the 'first' 10 after that cursor
  // If we have 'before', we fetch the 'last' 10 before that cursor
  const paginationArg = before 
    ? `last: 10, before: "${before}"` 
    : `first: 10, after: ${after ? `"${after}"` : "null"}`;

  const response = await admin.graphql(
    `#graphql
    query getProducts {
      products(${paginationArg}) {
        edges {
          cursor
          node {
            id
            title
            totalInventory
            featuredImage { url }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
      }
    }`
  );

  const responseJson = await response.json();
  return {
    products: responseJson.data.products.edges,
    pageInfo: responseJson.data.products.pageInfo,
  };
};

export default function InventoryPage() {
  const { products, pageInfo } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <AppProvider i18n={enTranslations}>
      <Page title="Store Inventory">
        <Layout>
          <Layout.Section>
            <Card>
              <ResourceList
                resourceName={{ singular: 'product', plural: 'products' }}
                items={products}
                renderItem={(item) => {
                  const { node } = item;
                  return (
                    <ResourceItem id={node.id} media={<img src={node.featuredImage?.url} alt="" style={{width: 40}} />}>
                      <Text variant="bodyMd" fontWeight="bold" as="h3">{node.title}</Text>
                      <div>Inventory: {node.totalInventory}</div>
                    </ResourceItem>
                  );
                }}
              />
              
              {/* Pagination UI */}
              <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  hasPrevious={pageInfo.hasPreviousPage}
                  onPrevious={() => {
                    setSearchParams({ before: pageInfo.startCursor });
                  }}
                  hasNext={pageInfo.hasNextPage}
                  onNext={() => {
                    setSearchParams({ after: pageInfo.endCursor });
                  }}
                />
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    </AppProvider>
  );
}