import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

async function testEndpoints() {
  console.log("Loading modules...");
  const { GET: getPosts } = await import("../src/app/api/posts/route");
  const { GET: getComments } = await import("../src/app/api/comments/route");
  const { NextRequest } = await import("next/server");

  try {
    console.log("Testing GET /api/posts...");
    const postsRes = await getPosts();
    const posts = await postsRes.json();
    console.log(`Successfully fetched ${posts.length} posts.`);
    console.log("First post:", posts[0]);

    if (posts.length > 0) {
      const firstPostId = posts[0].id;
      console.log(`\nTesting GET /api/comments for post ${firstPostId}...`);
      
      const req = new NextRequest(`http://localhost:3000/api/comments?postId=${firstPostId}`);
      const commentsRes = await getComments(req);
      const comments = await commentsRes.json();
      console.log(`Successfully fetched ${comments.length} comments.`);
      console.log("First comment:", comments[0]);
    }
    
    console.log("\nAll read endpoints verified successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

testEndpoints();
