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
  // Removed result image upload state

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
      const processedMembers = form.familyMembers;
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
        <div className="profile-overview">
          <div className="profile-card">
            <div className="profile-avatar" aria-hidden>
              {form.name ? form.name.split(" ").map(s => s[0]).slice(0, 2).join("") : "—"}
            </div>
            <div className="profile-name">{form.name || '—'}</div>
            <div className="profile-sub">{form.businessDetails || form.businessType || 'Member'}</div>

            <div className="profile-stats">
              <div className="stat-row"><div className="stat-label">Age</div><div className="stat-label">{form.age || '—'}</div></div>
              <div className="stat-row"><div className="stat-label">Village:</div><div className="stat-label">{form.village || '—'}</div></div>
              <div className="stat-row"><div className="stat-label">City:</div><div className="stat-label"> {form.cityName || '—'}</div></div>
              <div className="stat-row"><div className="stat-label">Current Address:</div> <div className="stat-label">{form.currentAddress || '—'}</div></div>
              <div className="stat-row"><div className="stat-label">Phone:</div><div className="stat-label"> {profileData?.user?.phone || form.phoneNumber || '—'}</div></div>
              <div className="stat-row"><div className="stat-label">Email:</div><div className="stat-label"> {profileData?.user?.email || '—'}</div></div>
              <div className="stat-row"><div className="stat-label">Business Type:</div><div className="stat-label"> {form.businessType || '—'}</div></div>
            </div>
          </div>

          <div className="profile-details">

            <h4 style={{ marginTop: 12 }}>Family Members</h4>
            <div className="family-grid">
              {form.familyMembers && form.familyMembers.length ? form.familyMembers.map((m, i) => (
                <div key={i} className="family-card">
                  <div className="family-top">
                    <div className="family-avatar">{m.memberName ? m.memberName.split(' ').map(s => s[0]).slice(0, 2).join('') : '—'}</div>
                    <div className="family-info">
                      <div className="family-name">{m.memberName || 'Member'}</div>
                      <div className="family-meta">{m.relation || ''} {m.age ? `· ${m.age} yrs` : ''}</div>
                    </div>
                  </div>
                  <div className="family-bio">
                    <div style={{marginBottom:6}}>{m.businessDescription || m.std ? (m.businessDescription || m.std) : '—'}</div>
                    <div className="family-meta-row">
                      {m.memberPhone && <div className="meta-item">📞 {m.memberPhone}</div>} 
                      {m.businessName && <div className="meta-item">🏷️ {m.businessName}</div>}
                      {m.businessWorkType && <div className="meta-item">💼 {m.businessWorkType}</div>}
                      {m.relation && <div className="meta-item">🧭 {m.relation}</div>}
                      {m.age ? <div className="meta-item">🎂 {m.age} yrs</div> : null}
                      {((m as any).createdAt) ? <div className="meta-item">⏱ {new Date((m as any).createdAt).toLocaleDateString()}</div> : null}
                    </div>
                  </div>
                </div>
              )) : <div>No family members added.</div>}
            </div>

            <div style={{ marginTop: 12 }}>
              <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
            </div>
          </div>
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
                  className={`input ${memberErrors[idx]?.includes("Member name")
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
                    className={`input ${memberErrors[idx]?.includes("Age") ? "input-error" : ""
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
                      className={`input ${memberErrors[idx]?.includes("Std") ? "input-error" : ""
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
                      className={`input ${memberErrors[idx]?.includes("Business work type")
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

                {m.activityType === "business" && (
                  <>
                    <input
                      className={`input ${memberErrors[idx]?.includes("Business name")
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
                      className={`input ${memberErrors[idx]?.includes("Business description")
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
                      className={`input ${memberErrors[idx]?.includes("None category")
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
