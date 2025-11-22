import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/AuthContext";
import { api } from "../api/client";
import { AuthCard } from "../components/ui/AuthCard";

interface Member {
  id?: string;
  memberName: string;
  age?: number | "";
  std?: string;
  percentage?: number | "";
  resultImage?: string;
  activityType?: string;
  businessWorkType?: string;
  businessName?: string;
  businessDescription?: string;
  memberPhone?: string;
  relation?: string;
  noneCategory?: string;
}
interface ProfileData {
  village?: string;
  name?: string;
  age?: number | "";
  currentAddress?: string;
  businessDetails?: string;
  phoneNumber?: string;
  cityName?: string;
  businessType?: string;
  totalFamilyMembers?: number | "";
  familyMembers: Member[];
}

const emptyMember: Member = {
  memberName: "",
  age: "",
  std: "",
  percentage: "",
  resultImage: "",
  activityType: "study",
  businessWorkType: "",
  businessName: "",
  businessDescription: "",
  memberPhone: "",
  relation: "",
  noneCategory: "",
};

const ProfileManage: React.FC = () => {
  const { token, profileData, profileLoading, hasProfile, initialized } =
    useAuth() as any;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [memberErrors, setMemberErrors] = useState<Record<number, string[]>>(
    {}
  );
  const [form, setForm] = useState<ProfileData>({
    familyMembers: [emptyMember],
  });
  const [editing, setEditing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Record<number, File>>({});
  const [uploadError, setUploadError] = useState<Record<number, string | null>>(
    {}
  );
  const [uploading, setUploading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!profileData?.profile) return;
    const { profile, familyMembers } = profileData;
    setForm({
      village: profile.village || "",
      name: profile.name || "",
      age: profile.age ?? "",
      currentAddress: profile.currentAddress || "",
      businessDetails: profile.businessDetails || "",
      phoneNumber: profile.phoneNumber || "",
      cityName: profile.cityName || "",
      businessType: profile.businessType || "",
      totalFamilyMembers: profile.totalFamilyMembers ?? "",
      familyMembers: (familyMembers || []).map((m: any) => ({
        id: m.id || m._id,
        memberName: m.memberName || "",
        age: m.age ?? "",
        std: m.std ?? "",
        percentage: m.percentage ?? "",
        resultImage: m.resultImage || "",
        activityType: m.activityType || "study",
        businessWorkType: m.businessWorkType || "",
        businessName: m.businessName || "",
        businessDescription: m.businessDescription || "",
        memberPhone: m.memberPhone || "",
        relation: m.relation || "",
        noneCategory: m.noneCategory || "",
      })),
    });
  }, [profileData]);

  const updateMember = (idx: number, patch: Partial<Member>) => {
    setForm((f) => ({
      ...f,
      familyMembers: f.familyMembers.map((m, i) =>
        i === idx ? { ...m, ...patch } : m
      ),
    }));
  };
  const addMember = () =>
    setForm((f) => ({
      ...f,
      familyMembers: [...f.familyMembers, emptyMember],
    }));
  const removeMember = (idx: number) => {
    setForm((f) => ({
      ...f,
      familyMembers: f.familyMembers.filter((_, i) => i !== idx),
    }));
    setSelectedFiles((files) => {
      const next: Record<number, File> = {};
      let ni = 0;
      Object.keys(files)
        .sort((a, b) => Number(a) - Number(b))
        .forEach((k) => {
          const i = Number(k);
          if (i === idx) return;
          next[ni++] = files[i];
        });
      return next;
    });
    setUploadError((errs) => {
      const next: Record<number, string | null> = {};
      let ni = 0;
      Object.keys(errs)
        .sort((a, b) => Number(a) - Number(b))
        .forEach((k) => {
          const i = Number(k);
          if (i === idx) return;
          next[ni++] = errs[i];
        });
      return next;
    });
    setUploading((up) => {
      const next: Record<number, boolean> = {};
      let ni = 0;
      Object.keys(up)
        .sort((a, b) => Number(a) - Number(b))
        .forEach((k) => {
          const i = Number(k);
          if (i === idx) return;
          next[ni++] = up[i];
        });
      return next;
    });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const mErrs: Record<number, string[]> = {};
    if (!form.name?.trim()) errs.name = "Name required";
    if (!form.village?.trim()) errs.village = "Village required";
    if (form.age === "" || form.age == null) errs.age = "Age required";
    if (!form.cityName?.trim()) errs.cityName = "City name required";
    if (!form.currentAddress?.trim())
      errs.currentAddress = "Current address required";
    if (!form.businessDetails?.trim())
      errs.businessDetails = "Business details required";
    form.familyMembers.forEach((m, i) => {
      const list: string[] = [];
      if (!m.memberName.trim()) list.push("Member name");
      if (m.age === "" || m.age == null) list.push("Age");
      if ((m.activityType || "study") === "study") {
        if (!m.std?.trim()) list.push("Std");
        if (m.percentage === "" || m.percentage == null)
          list.push("Percentage");
      } else if (m.activityType === "business") {
        if (!m.businessWorkType?.trim()) list.push("Business work type");
        if (!m.businessName?.trim()) list.push("Business name");
        if (!m.businessDescription?.trim()) list.push("Business description");
      } else if (m.activityType === "none") {
        if (m.age === "" || m.age == null) list.push("Age");
        if (!m.noneCategory?.trim()) list.push("None category");
      }
      if (list.length) mErrs[i] = list;
    });
    setFieldErrors(errs);
    setMemberErrors(mErrs);
    if (Object.keys(errs).length || Object.keys(mErrs).length) {
      setError("Please fix errors before saving");
      return false;
    }
    return true;
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setSaving(true);
    try {
      const processedMembers = await Promise.all(
        form.familyMembers.map(async (m, i) => {
          const file = selectedFiles[i];
          if (!file) return m;
          setUploading((u) => ({ ...u, [i]: true }));
          try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await api.post("/upload", fd);
            return { ...m, resultImage: res.data.url };
          } catch (err: any) {
            throw new Error(
              err.response?.data?.message || `Upload failed for member ${i + 1}`
            );
          } finally {
            setUploading((u) => ({ ...u, [i]: false }));
          }
        })
      );
      const payload = {
        village: form.village,
        name: form.name,
        age: form.age === "" ? undefined : form.age,
        currentAddress: form.currentAddress,
        businessDetails: form.businessDetails,
        phoneNumber: form.phoneNumber,
        cityName: form.cityName,
        businessType: form.businessType || undefined,
        totalFamilyMembers: undefined,
        familyMembers: processedMembers
          .filter((m) => m.memberName.trim())
          .map((m) => ({
            memberName: m.memberName,
            age: m.age === "" ? undefined : m.age,
            std: m.activityType === "study" ? m.std : undefined,
            percentage:
              m.activityType === "study"
                ? m.percentage === ""
                  ? undefined
                  : m.percentage
                : undefined,
            resultImage: m.activityType === "study" ? m.resultImage : undefined,
            activityType: m.activityType,
            businessWorkType:
              m.activityType === "business" ? m.businessWorkType : undefined,
            businessName:
              m.activityType === "business" ? m.businessName : undefined,
            businessDescription:
              m.activityType === "business" ? m.businessDescription : undefined,
            memberPhone: m.memberPhone?.trim() ? m.memberPhone : undefined,
            relation: m.relation?.trim() ? m.relation : undefined,
            noneCategory:
              m.activityType === "none"
                ? m.noneCategory || undefined
                : undefined,
          })),
      };
      await api.post("/profile", payload);
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (token && (profileLoading || (hasProfile === null && !profileData))) {
    return (
      <AuthCard title="My Profile" subtitle="Loading">
        <p>Loading profile...</p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="My Profile"
      subtitle={editing ? "Edit your details" : "Overview"}
    >
      {error && (
        <div className="field-error" style={{ marginBottom: "0.75rem" }}>
          {error}
        </div>
      )}
      {!editing && (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
        >
          <div>
            <strong>Name:</strong> {form.name || "—"}
          </div>
          <div>
            <strong>Age:</strong>{" "}
            {form.age !== "" && form.age != null ? form.age : "—"}
          </div>
          <div>
            <strong>Village:</strong> {form.village || "—"}
          </div>
          <div>
            <strong>Current Address:</strong> {form.currentAddress || "—"}
          </div>
          <div>
            <strong>Business Details:</strong> {form.businessDetails || "—"}
          </div>
          <div>
            <strong>City:</strong> {form.cityName || "—"}
          </div>
          <div>
            <strong>Business Type:</strong> {form.businessType || "—"}
          </div>
          <div>
            <strong>Family Members:</strong>
            <ul style={{ margin: 0, paddingLeft: "1rem" }}>
              {form.familyMembers.map((fm, i) => (
                <li key={i}>
                  {fm.memberName || "Member"}
                  {fm.age ? `, Age: ${fm.age}` : ""}
                  {(fm.activityType || "study") === "study" && fm.std
                    ? `, Std: ${fm.std}`
                    : ""}
                  {fm.activityType === "business" && fm.businessName
                    ? `, Business: ${fm.businessName}`
                    : ""}
                </li>
              ))}
            </ul>
          </div>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </button>
        </div>
      )}
      {editing && (
        <form onSubmit={save} className="member-editor">
          <input
            className={`input ${fieldErrors.name ? "input-error" : ""}`}
            placeholder="Name"
            value={form.name || ""}
            onChange={(e) => {
              setFieldErrors((fe) => {
                const n = { ...fe };
                delete n.name;
                return n;
              });
              setForm((f) => ({ ...f, name: e.target.value }));
            }}
          />
          {fieldErrors.name && (
            <div className="field-error">{fieldErrors.name}</div>
          )}
          <input
            className={`input ${fieldErrors.age ? "input-error" : ""}`}
            placeholder="Age"
            type="number"
            value={form.age || ""}
            onChange={(e) => {
              setFieldErrors((fe) => {
                const n = { ...fe };
                delete n.age;
                return n;
              });
              setForm((f) => ({
                ...f,
                age: e.target.value ? Number(e.target.value) : "",
              }));
            }}
          />
          {fieldErrors.age && (
            <div className="field-error">{fieldErrors.age}</div>
          )}
          <input
            className="input"
            placeholder="Village"
            value={form.village || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, village: e.target.value }))
            }
          />
          {fieldErrors.village && (
            <div className="field-error">{fieldErrors.village}</div>
          )}
          <input
            className="input"
            placeholder="Current Address"
            value={form.currentAddress || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, currentAddress: e.target.value }))
            }
          />
          {fieldErrors.currentAddress && (
            <div className="field-error">{fieldErrors.currentAddress}</div>
          )}
          <input
            className="input"
            placeholder="Business Details"
            value={form.businessDetails || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, businessDetails: e.target.value }))
            }
          />
          {fieldErrors.businessDetails && (
            <div className="field-error">{fieldErrors.businessDetails}</div>
          )}
          <input
            className={`input ${fieldErrors.cityName ? "input-error" : ""}`}
            placeholder="City Name"
            value={form.cityName || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, cityName: e.target.value }))
            }
          />
          {fieldErrors.cityName && (
            <div className="field-error">{fieldErrors.cityName}</div>
          )}
          <select
            className="input"
            value={form.businessType || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, businessType: e.target.value }))
            }
          >
            <option value="">Business Type</option>
            <option value="personal">Personal</option>
            <option value="job">Job</option>
            <option value="none">None</option>
          </select>
          <div className="member-grid">
            <strong>Family Members</strong>
            {form.familyMembers.map((m, idx) => (
              <div key={idx} className="member-card">
                <h4>Member {idx + 1}</h4>
                <input
                  className={`input ${
                    memberErrors[idx]?.includes("Member name")
                      ? "input-error"
                      : ""
                  }`}
                  placeholder="Member Name"
                  value={m.memberName}
                  onChange={(e) => {
                    updateMember(idx, { memberName: e.target.value });
                    setMemberErrors((me) => {
                      const copy = { ...me };
                      if (copy[idx])
                        copy[idx] = copy[idx].filter(
                          (x) => x !== "Member name"
                        );
                      if (!copy[idx]?.length) delete copy[idx];
                      return copy;
                    });
                  }}
                />
                <select
                  className="input"
                  value={m.activityType || "study"}
                  onChange={(e) =>
                    updateMember(idx, { activityType: e.target.value })
                  }
                >
                  <option value="study">Study</option>
                  <option value="business">Business</option>
                  <option value="none">None / Home</option>
                </select>
                <div className="inline-actions">
                  <input
                    className={`input ${
                      memberErrors[idx]?.includes("Age") ? "input-error" : ""
                    }`}
                    placeholder="Age"
                    type="number"
                    value={m.age || ""}
                    onChange={(e) => {
                      updateMember(idx, {
                        age: e.target.value ? Number(e.target.value) : "",
                      });
                      setMemberErrors((me) => {
                        const copy = { ...me };
                        if (copy[idx])
                          copy[idx] = copy[idx].filter((x) => x !== "Age");
                        if (!copy[idx]?.length) delete copy[idx];
                        return copy;
                      });
                    }}
                  />
                  {(m.activityType || "study") === "study" && (
                    <input
                      className={`input ${
                        memberErrors[idx]?.includes("Std") ? "input-error" : ""
                      }`}
                      placeholder="Std"
                      value={m.std || ""}
                      onChange={(e) => {
                        updateMember(idx, { std: e.target.value });
                        setMemberErrors((me) => {
                          const copy = { ...me };
                          if (copy[idx])
                            copy[idx] = copy[idx].filter((x) => x !== "Std");
                          if (!copy[idx]?.length) delete copy[idx];
                          return copy;
                        });
                      }}
                    />
                  )}
                  {m.activityType === "business" && (
                    <select
                      className={`input ${
                        memberErrors[idx]?.includes("Business work type")
                          ? "input-error"
                          : ""
                      }`}
                      value={m.businessWorkType || ""}
                      onChange={(e) => {
                        updateMember(idx, { businessWorkType: e.target.value });
                        setMemberErrors((me) => {
                          const copy = { ...me };
                          if (copy[idx])
                            copy[idx] = copy[idx].filter(
                              (x) => x !== "Business work type"
                            );
                          if (!copy[idx]?.length) delete copy[idx];
                          return copy;
                        });
                      }}
                    >
                      <option value="">Work Type</option>
                      <option value="personal">Personal</option>
                      <option value="job">Job</option>
                      <option value="none">None</option>
                    </select>
                  )}
                </div>
                {(m.activityType || "study") === "study" && m.resultImage && (
                  <img
                    src={m.resultImage}
                    alt={m.memberName}
                    className="member-img"
                  />
                )}
                {(m.activityType || "study") === "study" && (
                  <div className="file-picker">
                    <button
                      type="button"
                      className="file-picker-button"
                      onClick={() => {
                        const input = document.getElementById(
                          `pm-member-file-${idx}`
                        ) as HTMLInputElement | null;
                        input?.click();
                      }}
                    >
                      {selectedFiles[idx] || m.resultImage
                        ? "Change Result"
                        : "Choose Result"}
                    </button>
                    <span className="file-name">
                      {selectedFiles[idx]?.name ||
                        (m.resultImage ? "Selected" : "No file chosen")}
                    </span>
                    <input
                      id={`pm-member-file-${idx}`}
                      className="file-hidden"
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const allowed = [
                          "image/jpeg",
                          "image/png",
                          "image/jpg",
                        ];
                        if (!allowed.includes(file.type)) {
                          setUploadError((er) => ({
                            ...er,
                            [idx]: "Only JPG/JPEG/PNG",
                          }));
                          return;
                        }
                        if (file.size > 1024 * 1024) {
                          setUploadError((er) => ({
                            ...er,
                            [idx]: "File too large (1MB max)",
                          }));
                          return;
                        }
                        setUploadError((er) => ({ ...er, [idx]: null }));
                        setSelectedFiles((f) => ({ ...f, [idx]: file }));
                        const preview = URL.createObjectURL(file);
                        updateMember(idx, { resultImage: preview });
                      }}
                      disabled={uploading[idx]}
                    />
                  </div>
                )}
                {(m.activityType || "study") === "study" && (
                  <>
                    {uploading[idx] && (
                      <span className="uploading-flag">Uploading...</span>
                    )}
                    {uploadError[idx] && (
                      <div className="error-text">{uploadError[idx]}</div>
                    )}
                    <input
                      className={`input ${
                        memberErrors[idx]?.includes("Percentage")
                          ? "input-error"
                          : ""
                      }`}
                      placeholder="Percentage"
                      type="number"
                      value={m.percentage || ""}
                      onChange={(e) => {
                        updateMember(idx, {
                          percentage: e.target.value
                            ? Number(e.target.value)
                            : "",
                        });
                        setMemberErrors((me) => {
                          const copy = { ...me };
                          if (copy[idx])
                            copy[idx] = copy[idx].filter(
                              (x) => x !== "Percentage"
                            );
                          if (!copy[idx]?.length) delete copy[idx];
                          return copy;
                        });
                      }}
                    />
                  </>
                )}
                {m.activityType === "business" && (
                  <>
                    <input
                      className={`input ${
                        memberErrors[idx]?.includes("Business name")
                          ? "input-error"
                          : ""
                      }`}
                      placeholder="Business / Employer Name"
                      value={m.businessName || ""}
                      onChange={(e) => {
                        updateMember(idx, { businessName: e.target.value });
                        setMemberErrors((me) => {
                          const copy = { ...me };
                          if (copy[idx])
                            copy[idx] = copy[idx].filter(
                              (x) => x !== "Business name"
                            );
                          if (!copy[idx]?.length) delete copy[idx];
                          return copy;
                        });
                      }}
                    />
                    <input
                      className={`input ${
                        memberErrors[idx]?.includes("Business description")
                          ? "input-error"
                          : ""
                      }`}
                      placeholder="Business Description / Role"
                      value={m.businessDescription || ""}
                      onChange={(e) => {
                        updateMember(idx, {
                          businessDescription: e.target.value,
                        });
                        setMemberErrors((me) => {
                          const copy = { ...me };
                          if (copy[idx])
                            copy[idx] = copy[idx].filter(
                              (x) => x !== "Business description"
                            );
                          if (!copy[idx]?.length) delete copy[idx];
                          return copy;
                        });
                      }}
                    />
                  </>
                )}
                {m.activityType === "none" && (
                  <>
                    <select
                      className={`input ${
                        memberErrors[idx]?.includes("None category")
                          ? "input-error"
                          : ""
                      }`}
                      value={m.noneCategory || ""}
                      onChange={(e) => {
                        updateMember(idx, { noneCategory: e.target.value });
                        setMemberErrors((me) => {
                          const copy = { ...me };
                          if (copy[idx])
                            copy[idx] = copy[idx].filter(
                              (x) => x !== "None category"
                            );
                          if (!copy[idx]?.length) delete copy[idx];
                          return copy;
                        });
                      }}
                    >
                      <option value="">Select Category</option>
                      <option value="house_wife">House Wife</option>
                      <option value="retired">Retired</option>
                      <option value="child">Child</option>
                    </select>
                  </>
                )}
                <input
                  className="input"
                  placeholder="Member Phone (optional)"
                  value={m.memberPhone || ""}
                  onChange={(e) =>
                    updateMember(idx, { memberPhone: e.target.value })
                  }
                />
                <select
                  className="input"
                  value={m.relation || ""}
                  onChange={(e) =>
                    updateMember(idx, { relation: e.target.value })
                  }
                >
                  <option value="">Relation</option>
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="wife">Wife</option>
                  <option value="son">Son</option>
                  <option value="daughter">Daughter</option>
                  <option value="brother">Brother</option>
                  <option value="other">Other</option>
                </select>
                {memberErrors[idx] && (
                  <div className="field-error">
                    Missing: {memberErrors[idx].join(", ")}
                  </div>
                )}
                {form.familyMembers.length > 1 && (
                  <button
                    type="button"
                    className="member-remove"
                    onClick={() => removeMember(idx)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn-primary"
              style={{ gridColumn: "1 / -1" }}
              onClick={addMember}
            >
              Add Member
            </button>
          </div>
          <div className="profile-actions">
            <button disabled={saving} className="btn btn-primary" type="submit">
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="form-footer" style={{ marginTop: "1rem" }}>
        Need advanced changes? <Link to="/user-details">Open full form</Link>
      </div>
    </AuthCard>
  );
};
export default ProfileManage;
