import React from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  MapPin, 
  Phone,
  Edit3,
  Camera,
  ExternalLink
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { cn } from '../utils/cn';
import { motion } from 'motion/react';

const Profile: React.FC = () => {
  const { role, isDarkMode } = useFinance();

  const userInfo = {
    name: 'Sejal Shah',
    email: 'sejalshah681@gmail.com',
    role: role === 'admin' ? 'Administrator' : 'Viewer',
    joined: 'January 2024',
    location: 'Mumbai, India',
    phone: '+91 98765 43210',
    bio: 'Financial analyst and tech enthusiast. Passionate about data-driven decision making and personal finance management.'
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">User Profile</h2>
          <p className="text-muted-foreground mt-1">Manage your account settings and personal information.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95">
          <Edit3 size={18} />
          Edit Profile
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-8 shadow-soft flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-primary to-blue-400 p-[3px] shadow-xl shadow-primary/20">
                <div className="w-full h-full rounded-[21px] bg-card flex items-center justify-center text-primary font-bold text-4xl">
                  SS
                </div>
              </div>
              <button className="absolute bottom-0 right-0 p-2.5 bg-background border border-border rounded-xl shadow-lg text-muted-foreground hover:text-primary transition-colors">
                <Camera size={18} />
              </button>
            </div>
            
            <h3 className="text-2xl font-bold tracking-tight">{userInfo.name}</h3>
            <p className="text-muted-foreground font-medium mb-6">{userInfo.email}</p>
            
            <div className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-8",
              role === 'admin' ? "bg-success/15 text-success border border-success/10" : "bg-warning/15 text-warning border border-warning/10"
            )}>
              <Shield size={14} />
              {userInfo.role}
            </div>

            <div className="w-full space-y-4 pt-6 border-t border-border/50">
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">Joined:</span>
                <span className="font-semibold ml-auto">{userInfo.joined}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">Location:</span>
                <span className="font-semibold ml-auto">{userInfo.location}</span>
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
                  <span className="font-semibold">{userInfo.name}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</label>
                <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-2xl border border-transparent">
                  <Mail size={18} className="text-primary" />
                  <span className="font-semibold">{userInfo.email}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Number</label>
                <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-2xl border border-transparent">
                  <Phone size={18} className="text-primary" />
                  <span className="font-semibold">{userInfo.phone}</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account Type</label>
                <div className="flex items-center gap-3 p-4 bg-accent/30 rounded-2xl border border-transparent">
                  <Shield size={18} className="text-primary" />
                  <span className="font-semibold">{userInfo.role}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bio</label>
              <div className="p-6 bg-accent/30 rounded-2xl border border-transparent leading-relaxed text-muted-foreground">
                {userInfo.bio}
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
    </div>
  );
};

export default Profile;
