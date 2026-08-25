import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { X, CheckCircle, Upload, Loader2 } from "lucide-react";
import { serverUrl } from "../App";

const SupportTicketModal = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [subject, setSubject] = useState("Defective/Damaged Item");
  const [description, setDescription] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [attachmentName, setAttachmentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        return toast.error("Only image files (JPEG, PNG, JPG) are allowed.");
      }
      if (file.size > 10 * 1024 * 1024) {
        return toast.error("Image size must be less than 10MB.");
      }
      setAttachment(file);
      setAttachmentName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !subject || !description.trim()) {
      return toast.error("Please fill in all required fields.");
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("orderId", orderId);
      formData.append("subject", subject);
      formData.append("description", description);
      if (attachment) {
        formData.append("attachment", attachment);
      }

      const { data } = await axios.post(
        `${serverUrl}/api/ticket/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success(data.message || "Ticket raised successfully!");
        setSubmittedTicketId(data.ticketId);
        // Reset form
        setName("");
        setEmail("");
        setOrderId("");
        setSubject("Defective/Damaged Item");
        setDescription("");
        setAttachment(null);
        setAttachmentName("");
      }
    } catch (error) {
      console.error("Submit ticket error:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit support ticket. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmittedTicketId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black p-5 text-white flex justify-between items-center relative">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
              OwnFresh Support Center
            </span>
            <h3 className="text-xl font-bold mt-1 text-white">Raise a Support Ticket</h3>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {submittedTicketId ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100 animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Complaint Registered!</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Thank you. Your support ticket has been successfully registered. Our executive team will investigate and contact you shortly.
              </p>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 inline-block font-mono text-sm font-bold text-gray-800">
                Ticket ID: <span className="text-emerald-700">{submittedTicketId}</span>
              </div>
              <div className="pt-4">
                <button
                  onClick={handleClose}
                  className="px-8 py-3 bg-gray-900 text-white font-black text-sm uppercase tracking-wider rounded-xl hover:bg-yellow-500 hover:text-black transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all text-sm font-semibold text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all text-sm font-semibold text-gray-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-2">
                    Order ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. OF-12345"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all text-sm font-semibold text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-2">
                    Issue Category *
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all text-sm font-bold text-gray-700 cursor-pointer"
                  >
                    <option value="Defective/Damaged Item">Defective/Damaged Item</option>
                    <option value="Wrong Item Received">Wrong Item Received</option>
                    <option value="Delivery Delay">Delivery Delay</option>
                    <option value="Cancellation Request">Cancellation Request</option>
                    <option value="Payment/Refund Issue">Payment/Refund Issue</option>
                    <option value="Other Support Query">Other Support Query</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-2">
                  Describe Your Problem *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Please provide details about the issue with your order..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all text-sm font-semibold text-gray-800 resize-none leading-relaxed"
                />
              </div>

              {/* Upload Section */}
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 tracking-wider mb-2">
                  Attach Image (Optional)
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-200 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-6 h-6 text-gray-400 mb-1" />
                      <p className="text-xs text-gray-500 font-bold">
                        {attachmentName ? (
                          <span className="text-amber-600">{attachmentName}</span>
                        ) : (
                          "Upload PNG, JPG or JPEG"
                        )}
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold hover:text-black hover:bg-gray-200 rounded-xl transition cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 bg-gradient-to-r from-amber-500 via-[#FFDD00] to-amber-600 text-slate-950 rounded-xl font-black text-sm uppercase tracking-wider hover:from-yellow-400 hover:to-amber-500 transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Ticket"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportTicketModal;
