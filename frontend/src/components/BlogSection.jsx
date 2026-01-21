import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const BlogSection = () => {
  const [blogs, setBlogs] = useState([]);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/blog/all");
      setBlogs(res.data.blogs || []);
    } catch (error) {
      console.log("Error loading blogs:", error);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <div className="w-full px-6 max-w-7xl mx-auto py-16">
      <h2 className="text-3xl font-bold text-center mb-10">
        Latest Blogs
      </h2>

      {blogs.length === 0 ? (
        <p className="text-center text-gray-600">No blogs available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {blogs.map((blog) => (
            <Link
              to={`/blog/${blog._id}`}
              key={blog._id}
              className="bg-white shadow-lg rounded-xl p-4 hover:shadow-xl transition block"
            >
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full h-48 object-cover rounded-lg"
              />

              <h3 className="text-xl font-semibold mt-3">{blog.title}</h3>

              <p className="text-gray-600 mt-2 text-sm">
                {blog.description.slice(0, 90)}...
              </p>

              <span className="mt-4 text-[#ff4d2d] hover:underline font-medium inline-block">
                Read More →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogSection;
