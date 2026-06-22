import React, { useState } from "react";
import { UserProfile } from "../types";
import { getActiveUser, setActiveUser, updateUser, addLog } from "../dbStore";
import { User, Phone, MapPin, Mail, Image, Save, Shield } from "lucide-react";

interface ProfileSettingsProps {
  user: UserProfile;
}

export default function ProfileSettings({ user }: ProfileSettingsProps) {
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phoneNumber);
  const [whatsApp, setWhatsApp] = useState(user.whatsappNumber);
  const [address, setAddress] = useState(user.address);
  const [profilePic, setProfilePic] = useState(user.profilePicture);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedProfile: UserProfile = {
      ...user,
      fullName,
      email,
      phoneNumber: phone,
      whatsappNumber: whatsApp,
      address,
      profilePicture: profilePic,
    };

    updateUser(updatedProfile);
    setActiveUser(updatedProfile); // update active session cache

    addLog("audit", `Staff @${user.username} modified personal profile specifications.`, "info", user.username);
    alert("Success: Master profile updated on system registry.");
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-xl mx-auto space-y-6 shadow-sm text-xs">
      <div className="border-b pb-3 border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-sans">Modify Personnel Profile</h3>
        <p className="text-xs text-slate-500">Provide contact phone directories, avatar visuals and addresses.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Avatar Preview */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850">
          <img
            src={profilePic || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120"}
            alt="Avatar lookup"
            className="w-14 h-14 rounded-full object-cover shrink-0 border-2"
            referrerPolicy="no-referrer"
          />
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Current identity</span>
            <h4 className="font-bold text-slate-850 dark:text-white text-sm">{fullName || user.fullName}</h4>
            <span className="inline-block px-2 py-0.2 bg-blue-100 dark:bg-blue-950/40 text-[9px] text-blue-700 font-mono font-black uppercase rounded">
              Role: {user.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 col-span-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Avatar Image URL</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Image className="w-4 h-4" />
              </span>
              <input
                id="profile-pic-input"
                type="text"
                value={profilePic}
                onChange={(e) => setProfilePic(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                placeholder="https://images.unsplash.com/... or base64"
              />
            </div>
          </div>

          <div className="space-y-1 col-span-2 sm:col-span-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Staff Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <User className="w-4 h-4" />
              </span>
              <input
                id="profile-fullname-input"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1 col-span-2 sm:col-span-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Corporate Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="profile-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1 col-span-2 sm:col-span-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Phone Mobile Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                id="profile-phone-input"
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1 col-span-2 sm:col-span-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">WhatsApp Mobile Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Phone className="w-4 h-4 text-emerald-500" />
              </span>
              <input
                id="profile-whatsapp-input"
                type="text"
                required
                value={whatsApp}
                onChange={(e) => setWhatsApp(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1 col-span-2">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Residential Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <MapPin className="w-4 h-4" />
              </span>
              <input
                id="profile-address-input"
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          id="profile-save-btn"
          type="submit"
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 shadow uppercase transition"
        >
          <Save className="w-4 h-4" /> Save changes
        </button>

      </form>
    </div>
  );
}
