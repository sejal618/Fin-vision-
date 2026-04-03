import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  MapPin, 
  Phone,
  Edit3,
  Camera,
  ExternalLink,
  X,
  Save,
  RotateCcw,
  Check,
  Trash2
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { cn } from '../utils/cn';
import { motion, AnimatePresence } from 'motion/react';

const Profile: React.FC = () => {
  const { role, isDarkMode, user, updateUser } = useFinance();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please ensure you have given permission.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const saveProfilePic = () => {
    if (capturedImage) {
      updateUser({ profilePic: capturedImage });
      setIsCameraOpen(false);
      setCapturedImage(null);
    }
  };

  const deleteProfilePic = () => {
    updateUser({ profilePic: null });
    setIsCameraOpen(false);
    setCapturedImage(null);
  };

  useEffect(() => {
    if (isCameraOpen && !capturedImage) {
      startCamera();
    }
    return () => stopCamera();
  }, [isCameraOpen, capturedImage]);

  const [tempInfo, setTempInfo] = useState(user);

  const handleSave = () => {
    updateUser(tempInfo);
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">User Profile</h2>
          <p className="text-muted-foreground mt-1">Manage your account settings and personal information.</p>
        </div>
        <button 
          onClick={() => {
            setTempInfo(user);
            setIsEditModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95"
        >
          <Edit3 size={18} />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-8 shadow-soft flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold text-4xl shadow-xl shadow-primary/20 overflow-hidden">
                {user.profilePic ? (
                  <img src={user.profilePic} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  user.name.split(' ').map(n => n[0]).join('')
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 flex gap-1.5">
                {user.profilePic && (
                  <button 
                    onClick={deleteProfilePic}
                    className="p-1.5 bg-background/60 backdrop-blur-md border border-border/50 rounded-lg shadow-md text-danger hover:bg-danger/20 transition-all active:scale-95"
                    title="Delete Photo"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <button 
                  onClick={() => setIsCameraOpen(true)}
                  className="p-1.5 bg-background/60 backdrop-blur-md border border-border/50 rounded-lg shadow-md text-muted-foreground hover:text-primary transition-all active:scale-95"
                  title="Take Photo"
                >
                  <Camera size={14} />
                </button>
              </div>
            </div>
            
            <h3 className="text-2xl font-bold tracking-tight">{user.name}</h3>
            <p className="text-muted-foreground font-medium mb-6">{user.email}</p>
            
            <div className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-8",
              role === 'admin' ? "bg-success/15 text-success border border-success/10" : "bg-warning/15 text-warning border border-warning/10"
            )}>
              <Shield size={14} />
              {role === 'admin' ? 'Administrator' : 'Viewer'}
            </div>

            <div className="w-full space-y-4 pt-6 border-t border-border/50">
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">Joined:</span>
                <span className="font-semibold ml-auto">{user.joined}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">Location:</span>
                <span className="font-semibold ml-auto">{user.location}</span>
              </div>
            </div>
          </div>

          <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-8 shadow-soft">
            <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Security Status</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-sm font-semibold">Two-Factor Auth</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-success ml-auto">Enabled</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                <span className="text-sm font-semibold">Email Verified</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-success ml-auto">Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-8 shadow-soft">
            <h3 className="text-xl font-bold mb-6">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</label>
                <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-2xl border border-transparent">
                  <User size={18} className="text-primary" />
                  <span className="font-semibold">{user.name}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</label>
                <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-2xl border border-transparent">
                  <Mail size={18} className="text-primary" />
                  <span className="font-semibold">{user.email}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Number</label>
                <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-2xl border border-transparent">
                  <Phone size={18} className="text-primary" />
                  <span className="font-semibold">{user.phone}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account Type</label>
                <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-2xl border border-transparent">
                  <Shield size={18} className="text-primary" />
                  <span className="font-semibold">{role === 'admin' ? 'Administrator' : 'Viewer'}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bio</label>
              <div className="p-6 bg-accent/30 rounded-2xl border border-transparent leading-relaxed text-muted-foreground">
                {user.bio}
              </div>
            </div>
          </div>

          <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-8 shadow-soft">
            <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
            <div className="space-y-6">
              {[
                { action: 'Updated profile picture', time: '2 hours ago', icon: Camera },
                { action: 'Changed password', time: '3 days ago', icon: Shield },
                { action: 'Logged in from new device', time: '1 week ago', icon: ExternalLink },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-accent/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{item.action}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                "relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border",
                isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
              )}
            >
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <h3 className="text-xl font-bold">Edit Profile</h3>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-accent rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</label>
                    <input 
                      type="text"
                      value={tempInfo.name}
                      onChange={(e) => setTempInfo({ ...tempInfo, name: e.target.value })}
                      className={cn(
                        "w-full p-4 rounded-2xl border transition-all outline-none focus:ring-2 ring-primary/20",
                        isDarkMode ? "bg-zinc-800/50 border-zinc-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</label>
                    <input 
                      type="email"
                      value={tempInfo.email}
                      onChange={(e) => setTempInfo({ ...tempInfo, email: e.target.value })}
                      className={cn(
                        "w-full p-4 rounded-2xl border transition-all outline-none focus:ring-2 ring-primary/20",
                        isDarkMode ? "bg-zinc-800/50 border-zinc-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Number</label>
                    <input 
                      type="text"
                      value={tempInfo.phone}
                      onChange={(e) => setTempInfo({ ...tempInfo, phone: e.target.value })}
                      className={cn(
                        "w-full p-4 rounded-2xl border transition-all outline-none focus:ring-2 ring-primary/20",
                        isDarkMode ? "bg-zinc-800/50 border-zinc-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Location</label>
                    <input 
                      type="text"
                      value={tempInfo.location}
                      onChange={(e) => setTempInfo({ ...tempInfo, location: e.target.value })}
                      className={cn(
                        "w-full p-4 rounded-2xl border transition-all outline-none focus:ring-2 ring-primary/20",
                        isDarkMode ? "bg-zinc-800/50 border-zinc-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bio</label>
                  <textarea 
                    rows={4}
                    value={tempInfo.bio}
                    onChange={(e) => setTempInfo({ ...tempInfo, bio: e.target.value })}
                    className={cn(
                      "w-full p-4 rounded-2xl border transition-all outline-none focus:ring-2 ring-primary/20 resize-none",
                      isDarkMode ? "bg-zinc-800/50 border-zinc-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                    )}
                  />
                </div>
              </div>

              <div className="p-6 border-t border-border/50 flex gap-4">
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-4 rounded-2xl font-bold border border-border hover:bg-accent transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-4 rounded-2xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Camera Modal */}
      <AnimatePresence>
        {isCameraOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsCameraOpen(false);
                setCapturedImage(null);
              }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={cn(
                "relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border",
                isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-slate-200"
              )}
            >
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <h3 className="text-xl font-bold">Take Profile Photo</h3>
                <button 
                  onClick={() => {
                    setIsCameraOpen(false);
                    setCapturedImage(null);
                  }}
                  className="p-2 hover:bg-accent rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-black border border-border/50">
                  {!capturedImage ? (
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover mirror"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                  ) : (
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                  )}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </div>

              <div className="p-6 border-t border-border/50 flex flex-col gap-4">
                {!capturedImage ? (
                  <div className="flex gap-4">
                    {user.profilePic && (
                      <button 
                        onClick={deleteProfilePic}
                        className="flex-1 py-4 rounded-2xl font-bold bg-danger/10 text-danger hover:bg-danger/20 transition-all flex items-center justify-center gap-2"
                      >
                        <Trash2 size={18} />
                        Delete
                      </button>
                    )}
                    <button 
                      onClick={capturePhoto}
                      className={cn(
                        "py-4 rounded-2xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2",
                        user.profilePic ? "flex-1" : "w-full"
                      )}
                    >
                      <div className="w-4 h-4 rounded-full border-2 border-current" />
                      Capture Photo
                    </button>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => setCapturedImage(null)}
                      className="flex-1 py-4 rounded-2xl font-bold border border-border hover:bg-accent transition-all flex items-center justify-center gap-2"
                    >
                      <RotateCcw size={18} />
                      Retake
                    </button>
                    <button 
                      onClick={saveProfilePic}
                      className="flex-1 py-4 rounded-2xl font-bold bg-success text-white shadow-lg shadow-success/20 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Check size={18} />
                      Use Photo
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
