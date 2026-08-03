"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Monitor, Smartphone, Tablet, Globe, Search, RefreshCw, Calendar, Cpu } from "lucide-react";
import { SpinnerCustom } from "@/components/loading/Spinner";

type LoginRecord = {
  _id: string;
  ipAddress: string;
  country: string;
  city: string;
  browser: string;
  os: string;
  deviceType: string;
  screenResolution: string;
  deviceFingerprint: string;
  sessionId: string;
  referrer: string;
  userAgent: string;
  createdAt: string;
};

export default function UserTrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [history, setHistory] = useState<LoginRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filters
  const [ipFilter, setIpFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("");
  const [browserFilter, setBrowserFilter] = useState("");

  const fetchHistory = async () => {
    setLoading(true);
    const token = localStorage.getItem("auth_token");
    
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: "15",
      });
      if (ipFilter) queryParams.append("ipAddress", ipFilter);
      if (countryFilter) queryParams.append("country", countryFilter);
      if (deviceFilter) queryParams.append("deviceType", deviceFilter);
      if (browserFilter) queryParams.append("browser", browserFilter);

      const res = await fetch(`${process.env.NEXT_PUBLIC_NODE_API_URL}/user/${id}/login-history?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch login history");

      const data = await res.json();
      setHistory(data.history || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load user login history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchHistory();
    }
  }, [id, page]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new filter
    fetchHistory();
  };

  const clearFilters = () => {
    setIpFilter("");
    setCountryFilter("");
    setDeviceFilter("");
    setBrowserFilter("");
    setPage(1);
    // Next useEffect render will fetch without filters
    setTimeout(() => {
      fetchHistory();
    }, 0);
  };

  const getDeviceIcon = (deviceType: string) => {
    const t = deviceType.toLowerCase();
    if (t === "mobile") return <Smartphone size={16} className="text-blue-400" />;
    if (t === "tablet") return <Tablet size={16} className="text-purple-400" />;
    return <Monitor size={16} className="text-green-400" />;
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 p-4 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/users")}
          className="p-2 bg-gray-900 hover:bg-gray-800 rounded-md transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Login History & Tracking
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Audit trail of all login sessions for User ID: <span className="font-mono text-gray-300">{id}</span>
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-950 border border-gray-900 rounded-lg p-5 flex flex-col justify-center">
          <div className="text-gray-400 text-sm mb-1 font-medium flex items-center gap-2">
            <RefreshCw size={15} /> Total Logins
          </div>
          <div className="text-3xl font-bold text-white">{total}</div>
        </div>
        <div className="bg-gray-950 border border-gray-900 rounded-lg p-5 flex flex-col justify-center">
          <div className="text-gray-400 text-sm mb-1 font-medium flex items-center gap-2">
            <Calendar size={15} /> Latest Login
          </div>
          <div className="text-lg font-bold text-white">
            {history.length > 0 ? new Date(history[0].createdAt).toLocaleString() : "Never"}
          </div>
        </div>
        <div className="bg-gray-950 border border-gray-900 rounded-lg p-5 flex flex-col justify-center">
          <div className="text-gray-400 text-sm mb-1 font-medium flex items-center gap-2">
            <Cpu size={15} /> Latest Device
          </div>
          <div className="text-lg font-bold text-white capitalize flex items-center gap-2">
            {history.length > 0 ? (
              <>
                {getDeviceIcon(history[0].deviceType)} {history[0].deviceType}
              </>
            ) : "N/A"}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-950 border border-gray-900 p-4 rounded-lg">
        <form onSubmit={handleFilterSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-gray-400 mb-1 block">IP Address</label>
            <Input 
              placeholder="e.g. 192.168.0.1" 
              value={ipFilter} 
              onChange={(e) => setIpFilter(e.target.value)} 
              className="bg-black border-gray-800"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-gray-400 mb-1 block">Country</label>
            <Input 
              placeholder="e.g. US" 
              value={countryFilter} 
              onChange={(e) => setCountryFilter(e.target.value)} 
              className="bg-black border-gray-800"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-gray-400 mb-1 block">Device Type</label>
            <Input 
              placeholder="e.g. Mobile" 
              value={deviceFilter} 
              onChange={(e) => setDeviceFilter(e.target.value)} 
              className="bg-black border-gray-800"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-gray-400 mb-1 block">Browser</label>
            <Input 
              placeholder="e.g. Chrome" 
              value={browserFilter} 
              onChange={(e) => setBrowserFilter(e.target.value)} 
              className="bg-black border-gray-800"
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-primary hover:bg-primary/90 flex items-center gap-2">
              <Search size={16} /> Filter
            </Button>
            <Button type="button" onClick={clearFilters} className="bg-gray-800 hover:bg-gray-700">
              Clear
            </Button>
          </div>
        </form>
      </div>

      {/* History Table */}
      <div className="bg-gray-950 border border-gray-900 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-900/50 text-gray-400">
            <tr>
              <th className="px-4 py-3 font-medium">Date & Time</th>
              <th className="px-4 py-3 font-medium">Device & OS</th>
              <th className="px-4 py-3 font-medium">Browser</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">IP Address</th>
              <th className="px-4 py-3 font-medium">Fingerprint</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-900">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <SpinnerCustom />
                </td>
              </tr>
            ) : history.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  No login history found matching the criteria.
                </td>
              </tr>
            ) : (
              history.map((record, index) => (
                <tr key={record._id} className={`hover:bg-gray-900/40 transition-colors ${index === 0 && page === 1 ? "bg-primary/5" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-white">{new Date(record.createdAt).toLocaleDateString()}</span>
                      <span className="text-xs text-gray-500">{new Date(record.createdAt).toLocaleTimeString()}</span>
                      {index === 0 && page === 1 && <span className="text-[10px] uppercase font-bold tracking-widest text-primary mt-1">Latest</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(record.deviceType)}
                      <div>
                        <span className="text-white block capitalize">{record.deviceType}</span>
                        <span className="text-xs text-gray-500">{record.os}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-300">{record.browser}</span>
                    <span className="block text-xs text-gray-600 mt-0.5">{record.screenResolution}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <Globe size={14} className="text-gray-500" />
                      {record.city !== "Unknown" ? `${record.city}, ` : ""}{record.country}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-400">
                    {record.ipAddress}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-gray-500 bg-gray-900 px-2 py-0.5 rounded" title="Device Fingerprint">
                        {record.deviceFingerprint}
                      </span>
                      <span className="text-[10px] text-gray-600 mt-1 truncate max-w-[150px]" title={record.sessionId}>
                        {record.sessionId}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between bg-gray-950 p-4 rounded-lg border border-gray-900">
          <span className="text-sm text-gray-400">
            Showing Page {page} of {totalPages} ({total} Total Records)
          </span>
          <div className="flex gap-2">
            <Button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="bg-gray-800 hover:bg-gray-700"
            >
              Previous
            </Button>
            <Button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="bg-gray-800 hover:bg-gray-700"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
