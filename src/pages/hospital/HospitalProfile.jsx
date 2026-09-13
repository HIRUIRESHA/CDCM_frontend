import React, {
  useEffect,
  useState,
} from "react";

const HospitalProfile = () => {
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    licenseNumber: "",
    managerName: "",
    location: "",
    profileImage: "",
  });

  const [originalProfile, setOriginalProfile] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] =
    useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:8082/api/hospitals/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load hospital profile"
        );
      }

      setProfile(data);
      setOriginalProfile(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (event) => {
    setProfile({
      ...profile,
      [event.target.name]: event.target.value,
    });

    setError("");
    setMessage("");
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        "http://localhost:8082/api/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || "Image upload failed"
        );
      }

      setProfile((current) => ({
        ...current,
        profileImage: data.url,
      }));
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setEditing(false);
    setError("");
    setMessage("");
  };

  const handleSave = async () => {
    if (!profile.name?.trim()) {
      setError("Hospital name is required.");
      return;
    }

    if (!profile.contactNumber?.trim()) {
      setError("Contact number is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await fetch(
        "http://localhost:8082/api/hospitals/me",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: profile.name,
            contactNumber: profile.contactNumber,
            address: profile.address,
            managerName: profile.managerName,
            location: profile.location,
            profileImage: profile.profileImage,
          }),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Hospital profile update failed"
        );
      }

      setProfile(data);
      setOriginalProfile(data);
      setEditing(false);
      setMessage(
        "Hospital profile updated successfully."
      );

      const hospital = JSON.parse(
        localStorage.getItem("hospital") || "null"
      );

      if (hospital) {
        localStorage.setItem(
          "hospital",
          JSON.stringify({
            ...hospital,
            name: data.name,
            profileImage: data.profileImage,
          })
        );
      }

      const user = JSON.parse(
        localStorage.getItem("user") || "null"
      );

      if (user) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            name: data.name,
            profileImage: data.profileImage,
          })
        );
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    {
      label: "Hospital Name",
      name: "name",
      editable: true,
    },
    {
      label: "Email",
      name: "email",
      editable: false,
    },
    {
      label: "Contact Number",
      name: "contactNumber",
      editable: true,
    },
    {
      label: "Licence Number",
      name: "licenseNumber",
      editable: false,
    },
    {
      label: "Manager Name",
      name: "managerName",
      editable: true,
    },
    {
      label: "Location",
      name: "location",
      editable: true,
    },
  ];

  if (loading) {
    return (
      <div className="p-10 text-slate-600">
        Loading hospital profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-7 md:p-10">
        <div className="flex flex-col items-center border-b pb-8">
          <img
            src={
              profile.profileImage ||
              "https://cdn-icons-png.flaticon.com/512/2967/2967350.png"
            }
            alt="Hospital"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
          />

          {editing && (
            <label className="mt-4 cursor-pointer bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-semibold">
              {uploading
                ? "Uploading..."
                : "Change Image"}

              <input
                type="file"
                accept="image/*"
                hidden
                disabled={uploading}
                onChange={handleImageUpload}
              />
            </label>
          )}

          <h1 className="text-2xl font-bold text-slate-800 mt-4">
            {profile.name}
          </h1>

          <p className="text-slate-500">
            Hospital profile
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 rounded-lg p-3 mt-6">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 text-green-700 rounded-lg p-3 mt-6">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
          {fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {field.label}
              </label>

              <input
                type="text"
                name={field.name}
                value={profile[field.name] || ""}
                onChange={handleChange}
                disabled={
                  !editing || !field.editable
                }
                className="w-full border border-slate-300 rounded-xl p-3 disabled:bg-slate-100 disabled:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Address
            </label>

            <textarea
              name="address"
              rows={4}
              value={profile.address || ""}
              onChange={handleChange}
              disabled={!editing}
              className="w-full border border-slate-300 rounded-xl p-3 disabled:bg-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          {!editing ? (
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setMessage("");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving || uploading}
                className="border border-slate-300 px-6 py-3 rounded-xl"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving || uploading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold px-6 py-3 rounded-xl"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalProfile;