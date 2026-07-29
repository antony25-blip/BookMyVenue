import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

// Import Modular Components
import ToastAlert from "./components/ToastAlert";
import Navbar from "./components/Navbar";
import AuthForm from "./components/AuthForm";
import ExploreView from "./components/explore/ExploreView";
import VenueDetailModal from "./components/explore/VenueDetailModal";
import PaymentModal from "./components/explore/PaymentModal";
import PhotoGalleryModal from "./components/explore/PhotoGalleryModal";
import MyBookingsView from "./components/user/MyBookingsView";
import WishlistView from "./components/user/WishlistView";
import OwnerPanel from "./components/owner/OwnerPanel";
import AdminPanel from "./components/admin/AdminPanel";

const API = axios.create({ baseURL: "http://localhost:5001/api" });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const CATEGORIES = ["Birthday Hall", "Cafe", "Hotel", "Resort", "Auditorium", "Meetup Space"];
const LOCATIONS = ["Kochi", "Trivandrum", "Calicut", "Thrissur", "Kottayam", "Kannur"];
const TIME_HOURS = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`);

// Generate 1-hour slots between openTime and closeTime
const generateSlots = (openTime = "08:00", closeTime = "22:00", gapHours = 4, setupHours = 2, bookedSlots = []) => {
  const slots = [];
  const [openH] = openTime.split(":").map(Number);
  const [closeH] = closeTime.split(":").map(Number);
  const gapMins = gapHours * 60;
  const setupMins = setupHours * 60;

  for (let h = openH; h < closeH; h++) {
    const start = `${String(h).padStart(2, "0")}:00`;
    const end = `${String(h + 1).padStart(2, "0")}:00`;
    const startMins = h * 60;
    const endMins = (h + 1) * 60;

    const isBlocked = bookedSlots.some((s) => {
      const existStart = s.startTime.split(":").map(Number);
      const existEnd = s.endTime.split(":").map(Number);
      const existStartMins = existStart[0] * 60 + existStart[1];
      const existEndMins = existEnd[0] * 60 + existEnd[1];
      // Conflict if within setup/cleanup gap zone of existing booking
      return startMins < (existEndMins + gapMins) && endMins > (existStartMins - setupMins);
    });

    slots.push({ label: `${start} – ${end}`, start, end, isBlocked });
  }
  return slots;
};

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "", role: "user", phone: "", address: "" });
  const [activeTab, setActiveTab] = useState("explore");
  const [alert, setAlert] = useState(null);

  // Explore
  const [venues, setVenues] = useState([]);
  const [filters, setFilters] = useState({ search: "", category: "", location: "", minPrice: "", maxPrice: "", capacity: "" });

  // Venue detail
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);

  // Booking
  const [bookingType, setBookingType] = useState("hourly");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingEndDate, setBookingEndDate] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isDayAvailable, setIsDayAvailable] = useState(true);
  const [selectedSlotRange, setSelectedSlotRange] = useState({ start: null, end: null }); // multi-slot
  const [bookingGuests, setBookingGuests] = useState(1);
  const [paymentModalBooking, setPaymentModalBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  // User
  const [myBookings, setMyBookings] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  // Owner
  const [myVenues, setMyVenues] = useState([]);
  const [ownerBookings, setOwnerBookings] = useState([]);
  const [editingVenueId, setEditingVenueId] = useState(null);
  const [venueForm, setVenueForm] = useState({
    name: "", location: "", address: "", description: "",
    capacity: "", category: "Meetup Space",
    pricePerHour: "", pricePerDay: "",
    openTime: "08:00", closeTime: "22:00", gapHours: "4",
    amenities: ""
  });
  const [venueImages, setVenueImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [venueLicense, setVenueLicense] = useState(null);
  const [licensePreview, setLicensePreview] = useState("");

  // Admin
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminVenues, setAdminVenues] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);
  const [adminPayments, setAdminPayments] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [galleryPhotos, setGalleryPhotos] = useState(null);
  const [galleryVenueName, setGalleryVenueName] = useState("");
  const [largePhotoIndex, setLargePhotoIndex] = useState(null);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  useEffect(() => {
    fetchVenues();
    if (user?.role === "user") { fetchMyBookings(); fetchWishlist(); }
    else if (user?.role === "venue_owner") fetchMyVenues();
    else if (user?.role === "admin") fetchAdminDashboard();
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!galleryPhotos || largePhotoIndex === null) return;
      if (e.key === "ArrowLeft" || e.key === "Left") {
        setLargePhotoIndex((prev) => (prev === 0 ? galleryPhotos.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight" || e.key === "Right") {
        setLargePhotoIndex((prev) => (prev === galleryPhotos.length - 1 ? 0 : prev + 1));
      } else if (e.key === "Escape" || e.key === "Esc") {
        setLargePhotoIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [galleryPhotos, largePhotoIndex]);

  const fetchVenues = async (overrideFilters) => {
    try {
      const params = {};
      const f = overrideFilters || filters;
      Object.entries(f).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await API.get("/venues", { params });
      setVenues(res.data.venues);
    } catch (err) { console.error(err); }
  };

  // Auth
  const handleAuthChange = (e) => setAuthForm({ ...authForm, [e.target.name]: e.target.value });

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const payload = authMode === "login"
        ? { email: authForm.email, password: authForm.password }
        : authForm;
      const res = await API.post(endpoint, payload);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      showAlert("success", authMode === "login" ? `Welcome back, ${res.data.user.name}!` : "Account created successfully!");
      if (res.data.user.role === "venue_owner") setActiveTab("my-venues");
      else if (res.data.user.role === "admin") setActiveTab("admin-venues");
      else setActiveTab("explore");
    } catch (err) {
      showAlert("danger", err.response?.data?.message || "Authentication failed");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setMyBookings([]); setWishlist([]); setMyVenues([]); setOwnerBookings([]);
    setAdminUsers([]); setAdminVenues([]); setAdminBookings([]); setAdminPayments([]);
    setActiveTab("explore");
    showAlert("success", "Logged out successfully.");
  };

  // User ops
  const fetchMyBookings = async () => {
    try { const res = await API.get("/user/bookings"); setMyBookings(res.data.bookings); }
    catch (err) { console.error(err); }
  };

  const fetchWishlist = async () => {
    try {
      const res = await API.get("/user/wishlist");
      setWishlist(res.data.wishlist.map(i => i.venue?._id).filter(Boolean));
    } catch (err) { console.error(err); }
  };

  const toggleWishlist = async (venueId) => {
    if (!user) { setActiveTab("auth"); return; }
    const isIn = wishlist.includes(venueId);
    try {
      if (isIn) { await API.delete(`/user/wishlist/${venueId}`); setWishlist(w => w.filter(id => id !== venueId)); showAlert("info", "Removed from wishlist"); }
      else { await API.post(`/user/wishlist/${venueId}`); setWishlist(w => [...w, venueId]); showAlert("success", "Added to wishlist"); }
    } catch (err) { showAlert("danger", "Wishlist update failed"); }
  };

  // Venue detail
  const openVenueDetail = async (venue) => {
    setSelectedVenue(venue);
    setBookingDate(""); setBookingEndDate(""); setBookedSlots([]);
    setSelectedSlotRange({ start: null, end: null }); setBookingGuests(1);
    setBookingType("hourly"); setReviewForm({ rating: 5, comment: "" });
    try {
      const res = await API.get(`/venues/${venue._id}`);
      setReviews(res.data.reviews || []);
      setAvgRating(res.data.avgRating);
    } catch (err) { console.error(err); }
  };

  const fetchAvailability = async (date) => {
    setBookingDate(date);
    setSelectedSlotRange({ start: null, end: null });
    if (!date || !selectedVenue) return;
    try {
      const res = await API.get(`/venues/${selectedVenue._id}/availability?date=${date}`);
      setIsDayAvailable(res.data.isAvailable);
      setBookedSlots(res.data.bookedSlots || []);
    } catch (err) { showAlert("danger", "Failed to check availability"); }
  };

  const getBookingHours = () => {
    if (!selectedSlotRange.start || !selectedSlotRange.end) return 0;
    const [sh] = selectedSlotRange.start.split(":").map(Number);
    const [eh] = selectedSlotRange.end.split(":").map(Number);
    return eh - sh;
  };

  const handleSlotClick = (slot) => {
    if (slot.isBlocked) return;
    const currentHours = getBookingHours();
    if (!selectedSlotRange.start || currentHours > 1) {
      setSelectedSlotRange({ start: slot.start, end: slot.end });
    } else {
      let newStart = selectedSlotRange.start;
      let newEnd = slot.end;

      if (slot.start < selectedSlotRange.start) {
        newStart = slot.start;
        newEnd = selectedSlotRange.end;
      }

      if (newStart === selectedSlotRange.start && newEnd === selectedSlotRange.end) {
        setSelectedSlotRange({ start: null, end: null });
        return;
      }

      const [sh] = newStart.split(":").map(Number);
      const [eh] = newEnd.split(":").map(Number);
      const duration = eh - sh;

      if (selectedVenue?.category === "Auditorium" && duration > 6) {
        showAlert("warning", "Auditoriums can only be booked for a maximum of 6 hours.");
        return;
      }

      const slots = generateSlots(
        selectedVenue.openTime,
        selectedVenue.closeTime,
        selectedVenue.gapHours || 4,
        selectedVenue.setupHours || 2,
        bookedSlots
      );
      const isRangeBlocked = slots.some(s => s.isBlocked && s.start >= newStart && s.end <= newEnd);
      if (isRangeBlocked) {
        showAlert("danger", "Cannot select a range containing blocked slots.");
        return;
      }

      setSelectedSlotRange({ start: newStart, end: newEnd });
    }
  };

  const handleCreateBooking = async () => {
    if (!user) { setSelectedVenue(null); setActiveTab("auth"); showAlert("warning", "Please log in to book."); return; }
    try {
      const payload = {
        venueId: selectedVenue._id,
        bookingDate,
        guests: Number(bookingGuests),
        bookingType
      };
      if (bookingType === "hourly") {
        if (!selectedSlotRange.start || !selectedSlotRange.end) {
          showAlert("danger", "Please select at least one time slot."); return;
        }
        payload.startTime = selectedSlotRange.start;
        payload.endTime = selectedSlotRange.end;
      } else {
        if (!bookingEndDate) { showAlert("danger", "Please select a check-out date."); return; }
        payload.endDate = bookingEndDate;
      }
      const res = await API.post("/bookings", payload);
      setSelectedVenue(null);
      setPaymentModalBooking(res.data.booking);
    } catch (err) {
      showAlert("danger", err.response?.data?.message || "Booking failed");
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    try {
      await API.post("/payments", { bookingId: paymentModalBooking._id, paymentMethod });
      showAlert("success", "Payment successful! Your venue is locked.");
      setPaymentModalBooking(null);
      fetchMyBookings();
    } catch (err) {
      showAlert("danger", err.response?.data?.message || "Payment failed");
    }
  };

  const handleCancelBooking = async (id) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      await API.put(`/bookings/${id}/cancel`, { reason: "Cancelled by user" });
      showAlert("info", "Booking cancelled.");
      fetchMyBookings();
    } catch (err) { showAlert("danger", "Cancellation failed"); }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post(`/venues/${selectedVenue._id}/reviews`, reviewForm);
      setReviews(r => [res.data.review, ...r]);
      showAlert("success", "Review submitted!");
      const det = await API.get(`/venues/${selectedVenue._id}`);
      setAvgRating(det.data.avgRating);
      setReviewForm({ rating: 5, comment: "" });
    } catch (err) { showAlert("danger", err.response?.data?.message || "Review failed"); }
  };

  // Owner ops
  const fetchMyVenues = async () => {
    try {
      const res = await API.get("/venues/owner/my-venues");
      setMyVenues(res.data.venues);
      let all = [];
      for (const v of res.data.venues) {
        try {
          const br = await API.get(`/bookings/venue/${v._id}`);
          all = [...all, ...br.data.bookings.map(b => ({ ...b, venue: v }))];
        } catch { /* skip */ }
      }
      setOwnerBookings(all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) { console.error(err); }
  };

  const handleVenueFormChange = (e) => setVenueForm({ ...venueForm, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setVenueImages(files);
    setImagePreview(files.map(f => URL.createObjectURL(f)));
  };

  const handleLicenseChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVenueLicense(file);
      setLicensePreview(file.name);
    }
  };

  const handleSaveVenue = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(venueForm).forEach(([k, v]) => fd.append(k, v));
    venueImages.forEach(img => fd.append("images", img));
    if (venueLicense) fd.append("license", venueLicense);
    
    try {
      if (editingVenueId) {
        await API.put(`/venues/${editingVenueId}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("success", "Venue updated.");
      } else {
        await API.post("/venues", fd, { headers: { "Content-Type": "multipart/form-data" } });
        showAlert("success", "Venue submitted for admin approval.");
      }
      setVenueForm({ name: "", location: "", address: "", description: "", capacity: "", category: "Meetup Space", pricePerHour: "", pricePerDay: "", openTime: "08:00", closeTime: "22:00", gapHours: "4", setupHours: "2", amenities: "" });
      setVenueImages([]); setImagePreview([]); setEditingVenueId(null);
      setVenueLicense(null); setLicensePreview("");
      fetchMyVenues(); setActiveTab("my-venues");
    } catch (err) { showAlert("danger", err.response?.data?.message || "Failed to save venue"); }
  };

  const handleEditVenue = (v) => {
    setVenueForm({
      name: v.name, location: v.location, address: v.address, description: v.description,
      capacity: v.capacity, category: v.category, pricePerHour: v.pricePerHour,
      pricePerDay: v.pricePerDay || "", openTime: v.openTime || "08:00",
      closeTime: v.closeTime || "22:00", gapHours: v.gapHours || 4,
      setupHours: v.setupHours || 2,
      amenities: v.amenities.join(", ")
    });
    setEditingVenueId(v._id);
    setImagePreview(v.images.map(img => img.startsWith("/uploads") ? `http://localhost:5001${img}` : img));
    setLicensePreview(v.license ? v.license.split("/").pop() : "");
    setVenueLicense(null);
    setActiveTab("add-venue");
  };

  const handleDeleteVenue = async (id) => {
    if (!confirm("Delete this venue?")) return;
    try { await API.delete(`/venues/${id}`); showAlert("info", "Venue deleted."); fetchMyVenues(); }
    catch { showAlert("danger", "Delete failed"); }
  };

  const handleOwnerConfirm = async (id) => {
    try { await API.put(`/bookings/${id}/confirm`); showAlert("success", "Booking confirmed."); fetchMyVenues(); }
    catch (err) { showAlert("danger", err.response?.data?.message || "Confirm failed"); }
  };

  // Admin ops
  const fetchAdminDashboard = async () => {
    try {
      const [stats, users, avenues, bookings, payments] = await Promise.all([
        API.get("/admin/dashboard"), API.get("/admin/users"), API.get("/admin/venues"),
        API.get("/admin/bookings"), API.get("/admin/payments")
      ]);
      setAdminStats(stats.data.dashboard);
      setAdminUsers(users.data.users); setAdminVenues(avenues.data.venues);
      setAdminBookings(bookings.data.bookings); setAdminPayments(payments.data.payments);
    } catch (err) { console.error(err); }
  };

  const handleApproveVenue = async (id) => {
    try { await API.put(`/admin/venues/${id}/approve`); showAlert("success", "Venue approved."); fetchAdminDashboard(); fetchVenues(); }
    catch { showAlert("danger", "Approval failed"); }
  };

  const handleRejectVenue = async (id) => {
    try { await API.put(`/admin/venues/${id}/reject`); showAlert("info", "Venue unapproved."); fetchAdminDashboard(); fetchVenues(); }
    catch { showAlert("danger", "Reject failed"); }
  };

  const handleAdminDeleteVenue = async (id) => {
    if (!confirm("Delete this venue permanently?")) return;
    try { await API.delete(`/admin/venues/${id}`); showAlert("info", "Venue deleted."); fetchAdminDashboard(); fetchVenues(); }
    catch { showAlert("danger", "Delete failed"); }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    try { await API.delete(`/admin/users/${id}`); showAlert("info", "User removed."); fetchAdminDashboard(); }
    catch { showAlert("danger", "Delete failed"); }
  };

  return (
    <>
      {/* Toast Alert */}
      <ToastAlert alert={alert} onClose={() => setAlert(null)} />

      {/* Photo Gallery Modal */}
      <PhotoGalleryModal
        galleryPhotos={galleryPhotos}
        galleryVenueName={galleryVenueName}
        largePhotoIndex={largePhotoIndex}
        setLargePhotoIndex={setLargePhotoIndex}
        onClose={() => { setGalleryPhotos(null); setLargePhotoIndex(null); }}
      />

      {/* Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        fetchVenues={fetchVenues}
        fetchMyBookings={fetchMyBookings}
        handleLogout={handleLogout}
        setAuthMode={setAuthMode}
        setAuthForm={setAuthForm}
      />

      {/* Auth */}
      {activeTab === "auth" && !user && (
        <AuthForm
          authMode={authMode}
          setAuthMode={setAuthMode}
          authForm={authForm}
          setAuthForm={setAuthForm}
          handleAuth={handleAuth}
          handleAuthChange={handleAuthChange}
        />
      )}

      {/* Explore */}
      {activeTab === "explore" && (
        <ExploreView
          filters={filters}
          setFilters={setFilters}
          fetchVenues={fetchVenues}
          categories={CATEGORIES}
          locations={LOCATIONS}
          venues={venues}
          user={user}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          setGalleryPhotos={setGalleryPhotos}
          setGalleryVenueName={setGalleryVenueName}
          setLargePhotoIndex={setLargePhotoIndex}
          openVenueDetail={openVenueDetail}
        />
      )}

      {/* My Bookings (User) */}
      {activeTab === "my-bookings" && user?.role === "user" && (
        <MyBookingsView
          myBookings={myBookings}
          setActiveTab={setActiveTab}
          handleCancelBooking={handleCancelBooking}
        />
      )}

      {/* Wishlist (User) */}
      {activeTab === "wishlist" && user?.role === "user" && (
        <WishlistView
          venues={venues}
          wishlist={wishlist}
          toggleWishlist={toggleWishlist}
          setGalleryPhotos={setGalleryPhotos}
          setGalleryVenueName={setGalleryVenueName}
          setLargePhotoIndex={setLargePhotoIndex}
          openVenueDetail={openVenueDetail}
        />
      )}

      {/* Venue Detail Modal */}
      <VenueDetailModal
        selectedVenue={selectedVenue}
        setSelectedVenue={setSelectedVenue}
        user={user}
        reviews={reviews}
        avgRating={avgRating}
        bookingType={bookingType}
        setBookingType={setBookingType}
        bookingDate={bookingDate}
        setBookingDate={setBookingDate}
        bookingEndDate={bookingEndDate}
        setBookingEndDate={setBookingEndDate}
        bookingGuests={bookingGuests}
        setBookingGuests={setBookingGuests}
        bookedSlots={bookedSlots}
        isDayAvailable={isDayAvailable}
        selectedSlotRange={selectedSlotRange}
        reviewForm={reviewForm}
        setReviewForm={setReviewForm}
        handleAddReview={handleAddReview}
        handleCreateBooking={handleCreateBooking}
        fetchAvailability={fetchAvailability}
        handleSlotClick={handleSlotClick}
        setGalleryPhotos={setGalleryPhotos}
        setGalleryVenueName={setGalleryVenueName}
        setLargePhotoIndex={setLargePhotoIndex}
      />

      {/* Payment Modal */}
      <PaymentModal
        paymentModalBooking={paymentModalBooking}
        setPaymentModalBooking={setPaymentModalBooking}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        handleProcessPayment={handleProcessPayment}
      />

      {/* Owner Dashboard */}
      {user?.role === "venue_owner" && ["my-venues", "add-venue", "owner-bookings", "owner-analytics"].includes(activeTab) && (
        <OwnerPanel
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          myVenues={myVenues}
          ownerBookings={ownerBookings}
          editingVenueId={editingVenueId}
          setEditingVenueId={setEditingVenueId}
          venueForm={venueForm}
          setVenueForm={setVenueForm}
          venueImages={venueImages}
          setVenueImages={setVenueImages}
          imagePreview={imagePreview}
          setImagePreview={setImagePreview}
          venueLicense={venueLicense}
          setVenueLicense={setVenueLicense}
          licensePreview={licensePreview}
          setLicensePreview={setLicensePreview}
          handleVenueFormChange={handleVenueFormChange}
          handleImageChange={handleImageChange}
          handleLicenseChange={handleLicenseChange}
          handleSaveVenue={handleSaveVenue}
          handleEditVenue={handleEditVenue}
          handleDeleteVenue={handleDeleteVenue}
          handleOwnerConfirm={handleOwnerConfirm}
          fetchMyVenues={fetchMyVenues}
          categories={CATEGORIES}
          locations={LOCATIONS}
          timeHours={TIME_HOURS}
          setGalleryPhotos={setGalleryPhotos}
          setGalleryVenueName={setGalleryVenueName}
          setLargePhotoIndex={setLargePhotoIndex}
        />
      )}

      {/* Admin Dashboard */}
      {user?.role === "admin" && activeTab.startsWith("admin-") && (
        <AdminPanel
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          adminStats={adminStats}
          adminVenues={adminVenues}
          adminUsers={adminUsers}
          adminBookings={adminBookings}
          adminPayments={adminPayments}
          handleApproveVenue={handleApproveVenue}
          handleRejectVenue={handleRejectVenue}
          handleAdminDeleteVenue={handleAdminDeleteVenue}
          handleDeleteUser={handleDeleteUser}
          fetchAdminDashboard={fetchAdminDashboard}
          setGalleryPhotos={setGalleryPhotos}
          setGalleryVenueName={setGalleryVenueName}
          setLargePhotoIndex={setLargePhotoIndex}
        />
      )}

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border-color)", padding: "24px 40px", marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", fontSize: "0.85rem", color: "var(--text-muted)", background: "rgba(10,10,15,0.5)" }}>
        <div>&copy; 2026 BookMyVenue — Kerala's Premium Venue Platform</div>
        <div>Admin Login: <span style={{ color: "var(--text-secondary)" }}>admin@gmail.com</span></div>
      </footer>
    </>
  );
}
