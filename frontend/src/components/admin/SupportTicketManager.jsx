import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Search, Filter, Eye, RefreshCw, X, FileText, Calendar, User, Mail, Clipboard, ShieldAlert } from "lucide-react";
import { serverUrl } from "../../App";

const SupportTicketManager = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${serverUrl}/api/ticket/admin/all?search=${search}&status=${filterStatus}`,
        { withCredentials: true }
      );
      if (data.success) {
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error("Fetch support tickets error:", error);
      toast.error(error.response?.data?.message || "Failed to load support tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filterStatus]); // Re-fetch on status filter change

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
  };

  const handleUpdateStatus = async () => {
    if (!selectedTicket) return;
    setStatusUpdating(true);
    try {
      const { data } = await axios.put(
        `${serverUrl}/api/ticket/admin/status/${selectedTicket.ticketId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Ticket status updated successfully!");
        setSelectedTicket(data.ticket);
        fetchTickets();
      }
    } catch (error) {
      console.error("Update ticket status error:", error);
      toast.error(error.response?.data?.message || "Failed to update status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  // Get status color styling
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "Open":
        return "bg-rose-50 border-rose-200 text-rose-700";
      case "In Progress":
        return "bg-sky-50 border-sky-200 text-sky-700";
      case "Resolved":
        return "bg-emerald-50 border-emerald-200 text-emerald-700";
      case "Closed":
        return "bg-slate-100 border-slate-350 text-slate-600";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Support Ticket Management</h2>
          <p className="text-xs text-gray-500 mt-1">Review customer return/refund tickets, check attachments, and update workflow status.</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ID, customer, order..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 font-semibold"
            />
          </form>

          <button
            onClick={fetchTickets}
            className="p-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 transition rounded-xl text-gray-600"
            title="Refresh List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="py-2.5 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Loading Support Tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-700">No Tickets Found</h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">There are no support tickets matching your selection at the moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs font-extrabold uppercase text-gray-500 tracking-wider">
                  <th className="py-4 px-6">Ticket ID</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Subject / Category</th>
                  <th className="py-4 px-6">Order ID</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm font-semibold text-gray-750">
                {tickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-gray-900">{ticket.ticketId}</td>
                    <td className="py-4 px-6 text-xs text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900 text-xs sm:text-sm">{ticket.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono mt-0.5">{ticket.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs bg-amber-50 text-amber-800 border border-amber-100 px-2 py-0.5 rounded font-extrabold uppercase tracking-wide">
                        {ticket.subject}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs">{ticket.orderId || "N/A"}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold border uppercase tracking-wider ${getStatusBadgeStyle(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleViewTicket(ticket)}
                        className="p-2 hover:bg-slate-200/50 text-gray-600 hover:text-black rounded-xl transition inline-flex items-center gap-1 cursor-pointer border border-transparent"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-xs font-bold">Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Details Inspection Drawer/Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black p-5 text-white flex justify-between items-center relative">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                  Inspect Ticket System
                </span>
                <h3 className="text-xl font-bold mt-1 text-white font-mono">{selectedTicket.ticketId}</h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-150 text-xs leading-relaxed font-semibold">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span><b>Name:</b> {selectedTicket.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span><b>Email:</b> {selectedTicket.email}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clipboard className="w-3.5 h-3.5 text-gray-400" />
                    <span><b>Order ID:</b> {selectedTicket.orderId || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      <b>Created:</b>{" "}
                      {new Date(selectedTicket.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject Tag */}
              <div>
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">Subject Category</h4>
                <div className="inline-block px-3 py-1 bg-amber-50 text-amber-800 border border-amber-100 rounded text-xs font-bold uppercase tracking-wider">
                  {selectedTicket.subject}
                </div>
              </div>

              {/* Problem Description */}
              <div>
                <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">Detailed Issue Description</h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm font-medium text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.description}
                </div>
              </div>

              {/* Image Attachment */}
              {selectedTicket.attachment && (
                <div>
                  <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">Image Attachment</h4>
                  <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden p-2 flex justify-center max-h-[300px]">
                    <img
                      src={selectedTicket.attachment}
                      alt="Attachment Preview"
                      className="max-h-[280px] object-contain rounded-lg"
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                </div>
              )}

              {/* Ticket Status Workflow Updater */}
              <div className="pt-4 border-t border-gray-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div>
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1.5">Current Status</h4>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold border uppercase tracking-wider ${getStatusBadgeStyle(selectedTicket.status)}`}>
                      {selectedTicket.status}
                    </span>
                  </div>

                  <div className="text-gray-300 self-end text-xl">→</div>

                  <div>
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider mb-1">Set New Status</h4>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="py-1.5 px-3 bg-white border border-gray-350 rounded-xl text-xs font-bold text-gray-700 outline-none cursor-pointer focus:border-amber-500"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-gray-100 text-gray-700 font-bold hover:text-black hover:bg-gray-200 rounded-xl transition cursor-pointer text-xs"
                  >
                    Close Drawer
                  </button>
                  <button
                    onClick={handleUpdateStatus}
                    disabled={statusUpdating || newStatus === selectedTicket.status}
                    className="flex-1 sm:flex-initial px-6 py-2.5 bg-gradient-to-r from-amber-500 via-[#FFDD00] to-amber-600 text-slate-950 rounded-xl font-black text-xs uppercase tracking-wider hover:from-yellow-400 hover:to-amber-500 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {statusUpdating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTicketManager;
