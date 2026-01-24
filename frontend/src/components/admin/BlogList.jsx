// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const BlogList = () => {
//   const [blogs, setBlogs] = useState([]);
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("");
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   // Edit modal states
//   const [editData, setEditData] = useState(null);
//   const [editTitle, setEditTitle] = useState("");
//   const [editDescription, setEditDescription] = useState("");
//   const [editImage, setEditImage] = useState(null);

//   const navigate = useNavigate();

//   // Fetch blogs
//   const fetchBlogs = async () => {
//     try {
//       const res = await axios.get("http://localhost:8000/api/blog/all", {
//         params: {
//           page,
//           limit: 6,
//           search,
//           category,
//         },
//       });

//       setBlogs(res.data.blogs || []);
//       setTotalPages(res.data.totalPages || 1);
//     } catch (error) {
//       alert("Failed to load blogs");
//     }
//   };

//   useEffect(() => {
//     fetchBlogs();
//   }, [page, search, category]);

//   // Delete blog
//   const deleteBlog = async (id) => {
//     if (!window.confirm("Delete this blog?")) return;

//     try {
//       await axios.delete(`http://localhost:8000/api/blog/delete/${id}`);
//       alert("Blog deleted");
//       fetchBlogs();
//     } catch (err) {
//       alert("Failed to delete blog");
//     }
//   };

//   // Open edit modal
//   const openEditModal = (blog) => {
//     setEditData(blog);
//     setEditTitle(blog.title);
//     setEditDescription(blog.description);
//     setEditImage(null);
//   };

//   // Update blog
//   const updateBlog = async () => {
//     const formData = new FormData();
//     formData.append("title", editTitle);
//     formData.append("description", editDescription);

//     if (editImage) {
//       formData.append("image", editImage);
//     }

//     try {
//       await axios.put(
//         `http://localhost:8000/api/blog/update/${editData._id}`,
//         formData
//       );
//       alert("Blog updated");
//       setEditData(null);
//       fetchBlogs();
//     } catch (err) {
//       alert("Failed to update");
//     }
//   };

//   return (
//     <div className="w-full px-6 py-20">
//       <h2 className="text-2xl font-bold mb-6">Blog List</h2>

//       {/* Search + Category */}
//       <div className="flex flex-col md:flex-row gap-4 mb-6">
//         <input
//           className="border p-2 rounded w-full"
//           placeholder="Search blogs..."
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//             setPage(1);
//           }}
//         />

//         <select
//           className="border p-2 rounded w-full md:w-60"
//           value={category}
//           onChange={(e) => {
//             setCategory(e.target.value);
//             setPage(1);
//           }}
//         >
//           <option value="">All Categories</option>
//           <option value="Tech">Tech</option>
//           <option value="CNC">CNC</option>
//           <option value="Mechanical">Mechanical</option>
//           <option value="Industry">Industry</option>
//           <option value="AI">AI</option>
//           <option value="Other">Other</option>
//         </select>
//       </div>

//       {/* Blog Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         {blogs.map((b) => (
//           <div
//             key={b._id}
//             className="bg-white shadow-md rounded-xl p-4 relative"
//           >
//             <img
//               src={b.image}
//               alt={b.title}
//               className="w-full h-48 object-cover rounded-lg cursor-pointer"
//               onClick={() => navigate(`/blogs/${b._id}`)}
//             />

//             <span className="text-xs bg-blue-200 px-2 py-1 rounded mt-2 inline-block">
//               {b.category || "Other"}
//             </span>

//             <h3 className="text-lg font-semibold mt-2">{b.title}</h3>
//             <p className="text-gray-600">{b.description.slice(0, 80)}...</p>

//             {/* ACTION BUTTONS */}
//             <div className="flex gap-3 mt-4">
//               <button
//                 onClick={() => openEditModal(b)}
//                 className="bg-blue-500 text-white px-3 py-1 rounded"
//               >
//                 Edit
//               </button>

//               <button
//                 onClick={() => deleteBlog(b._id)}
//                 className="bg-red-500 text-white px-3 py-1 rounded"
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* PAGINATION */}
//       <div className="flex justify-center gap-5 mt-10">
//         <button
//           disabled={page <= 1}
//           onClick={() => setPage(page - 1)}
//           className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
//         >
//           Prev
//         </button>

//         <span className="font-semibold">
//           Page {page} of {totalPages}
//         </span>

//         <button
//           disabled={page >= totalPages}
//           onClick={() => setPage(page + 1)}
//           className="px-4 py-2 bg-gray-200 rounded disabled:opacity-40"
//         >
//           Next
//         </button>
//       </div>

//       {/* EDIT MODAL */}
//       {editData && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
//           <div className="bg-white p-6 rounded-xl w-[90%] max-w-lg">
//             <h2 className="text-xl font-bold mb-4">Edit Blog</h2>

//             <input
//               className="border w-full p-2 mb-3 rounded"
//               value={editTitle}
//               onChange={(e) => setEditTitle(e.target.value)}
//             />

//             <textarea
//               className="border w-full p-2 mb-3 rounded h-32"
//               value={editDescription}
//               onChange={(e) => setEditDescription(e.target.value)}
//             />

//             <input
//               type="file"
//               className="border w-full p-2 mb-3 rounded"
//               onChange={(e) => setEditImage(e.target.files[0])}
//             />

//             <div className="flex gap-4 mt-3">
//               <button
//                 onClick={updateBlog}
//                 className="bg-green-600 text-white px-4 py-2 rounded"
//               >
//                 Update
//               </button>
//               <button
//                 onClick={() => setEditData(null)}
//                 className="bg-gray-500 text-white px-4 py-2 rounded"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BlogList;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import {
  Search,
  Filter,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Tag,
  ExternalLink,
  X,
  Upload
} from "lucide-react";

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [editData, setEditData] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImage, setEditImage] = useState(null);
  const [editPreview, setEditPreview] = useState(null);

  const navigate = useNavigate();
  const userData = useSelector((state) => state.user.userData);

  const fetchBlogs = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/blog/all", {
        params: { page, limit: 6, search, category },
      });
      setBlogs(res.data.blogs || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Failed to load blogs");
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [page, search, category]);

  const deleteBlog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/blog/delete/${id}`);
      fetchBlogs();
    } catch (err) {
      alert("Failed to delete blog");
    }
  };

  const openEditModal = (blog) => {
    setEditData(blog);
    setEditTitle(blog.title);
    setEditDescription(blog.description);
    setEditPreview(blog.image);
    setEditImage(null);
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImage(file);
      setEditPreview(URL.createObjectURL(file));
    }
  };

  const updateBlog = async () => {
    const formData = new FormData();
    formData.append("title", editTitle);
    formData.append("description", editDescription);
    if (editImage) formData.append("image", editImage);

    try {
      await axios.put(`http://localhost:8000/api/blog/update/${editData._id}`, formData);
      setEditData(null);
      fetchBlogs();
    } catch (err) {
      alert("Failed to update");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 md:px-8 lg:px-16 py-12">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Industry <span className="text-[#ff4d2d]">Insights</span>
        </h2>
        <p className="text-slate-500 max-w-2xl">
          Manage and monitor your latest company updates and oil market analysis.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="max-w-7xl mx-auto mb-10 p-4 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#ff4d2d]/20 outline-none"
            placeholder="Search reports or news..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div className="relative w-full md:w-72">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <select
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          >
            <option value="">All Sectors</option>
            <option value="Tech">Tech</option>
            <option value="CNC">CNC</option>
            <option value="Mechanical">Mechanical</option>
            <option value="Industry">Industry News</option>
            <option value="AI">AI</option>
          </select>
        </div>
      </div>

      {/* BLOG GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((b) => (
          <div key={b._id} className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 flex flex-col">
            
            {/* IMAGE */}
            <div 
              className="relative w-full h-56 bg-slate-100 overflow-hidden cursor-pointer"
              onClick={() => navigate(`/blogs/${b._id}`)}
            >
              <img
                src={b.image}
                alt={b.title}
                className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
              />
            </div>

            {/* CONTENT */}
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2 min-h-[3.5rem]">
                {b.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {b.description.slice(0, 100)}...
              </p>

              {/* ACTIONS */}
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                <button 
                  onClick={() => navigate(`/blogs/${b._id}`)}
                  className="text-slate-400 hover:text-[#ff4d2d]"
                >
                  <ExternalLink className="w-5 h-5" />
                </button>

                {/* ADMIN ONLY */}
                {userData?.role === "admin" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(b)}
                      className="p-2 bg-slate-50 hover:bg-blue-50 text-blue-600 rounded-lg"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteBlog(b._id)}
                      className="p-2 bg-slate-50 hover:bg-red-50 text-red-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION (RESTORED) */}
      <div className="max-w-7xl mx-auto mt-16 flex items-center justify-center gap-8">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="p-3 rounded-full bg-white border text-slate-600 disabled:opacity-30 hover:bg-[#ff4d2d] hover:text-white transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <span className="text-slate-500 font-medium">
          Page <span className="text-slate-900 font-bold">{page}</span> of {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className="p-3 rounded-full bg-white border text-slate-600 disabled:opacity-30 hover:bg-[#ff4d2d] hover:text-white transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* EDIT MODAL (Admin Only) */}
      {editData && userData?.role === "admin" && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden">
            
            {/* HEADER */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-slate-800">Edit Post</h2>
              <button onClick={() => setEditData(null)}><X className="w-6 h-6 text-slate-400" /></button>
            </div>

            {/* BODY */}
            <div className="p-6 space-y-4">

              <input
                className="w-full px-4 py-3 bg-slate-50 border rounded-xl"
                placeholder="Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />

              <textarea
                className="w-full px-4 py-3 bg-slate-50 border rounded-xl h-32 resize-none"
                placeholder="Description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />

              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border-2 border-dashed">
                <div className="w-20 h-20 rounded-lg bg-white overflow-hidden border">
                  <img src={editPreview} className="w-full h-full object-contain" alt="Preview" />
                </div>

                <label className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg cursor-pointer">
                  <Upload className="w-4 h-4" /> Change Image
                  <input type="file" className="hidden" onChange={handleEditImageChange} />
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={updateBlog}
                  className="flex-grow py-3 bg-[#ff4d2d] text-white rounded-xl font-bold"
                >
                  Save Changes
                </button>

                <button
                  onClick={() => setEditData(null)}
                  className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl"
                >
                  Cancel
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default BlogList;

