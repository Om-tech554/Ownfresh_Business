import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Loader2 } from "lucide-react";

const UserBlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBlog = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/blog/${id}`);
      setBlog(res.data.blog);
    } catch (error) {
      console.log("Error loading blog:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlog();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#ff4d2d]" />
        <p className="mt-3 text-gray-500">Loading article...</p>
      </div>
    );

  if (!blog)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold">Blog not found</h2>
        <button
          onClick={() => navigate(-1)}
          className="text-[#ff4d2d] mt-4 flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Back
        </button>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-[#ff4d2d] transition mb-6"
      >
        <ArrowLeft size={18} /> Back to Blogs
      </button>

      {/* Blog image */}
      <img
        src={blog.image}
        alt={blog.title}
        className="w-full max-h-[450px] object-contain rounded-lg bg-gray-100 mb-6"
      />

      {/* Blog title */}
      <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>

      {/* Publish date */}
      <p className="text-gray-500 text-sm mb-8">
        Published on {new Date(blog.createdAt).toLocaleDateString()}
      </p>

      {/* Blog content */}
      <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
        {blog.description}
      </p>
    </div>
  );
};

export default UserBlogDetails;
