import React, { useEffect, useState, useRef } from "react";
import { api } from "../api/client";
import { useAuth } from "../hooks/AuthContext";
import { useNavigate } from "react-router-dom";
import { AuthCard } from "../components/ui/AuthCard";

interface FamilyMemberForm {
  memberName: string;
  age?: number | "";
  std?: string;
  activityType?: string; // અભ્યાસ | વ્યવસાય | none
  businessWorkType?: string; // વ્યક્તિગત | નોકરી | none
  businessName?: string;
  businessDescription?: string;
  memberPhone?: string;
  relation?: string;
  noneCategory?: string; // ગૃહિણી | નિવૃત્ત | બાળક
}

interface ProfileForm {
  village?: string;
  name?: string;
  age?: number | "";
  currentAddress?: string;
  businessDetails?: string;
  phoneNumber?: string;
  cityName?: string;
  businessType?: string; // વ્યક્તિગત | નોકરી | none
  familyMembers: FamilyMemberForm[];
}

const emptyMember: FamilyMemberForm = {
  memberName: "",
  age: "",
  std: "",
  activityType: "અભ્યાસ",
  businessWorkType: "",
  businessName: "",
  businessDescription: "",
  memberPhone: "",
  relation: "",
  noneCategory: "",
};

const UserDetailsForm: React.FC = () => {
  const { token, setHasProfile, hasProfile, logout, refetchProfile } = useAuth() as any;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    familyMembers: [emptyMember],
  });
  // Removed result image upload from form
  const [shouldShowForm, setShouldShowForm] = useState(false);
  // Autocomplete state for village
  const [villageQuery, setVillageQuery] = useState("");
  const [villageSuggestions, setVillageSuggestions] = useState<string[]>([]);
  const [villageLoading, setVillageLoading] = useState(false);
  const [showVillageSuggestions, setShowVillageSuggestions] = useState(false);
  const villageDebounceRef = useRef<number | null>(null);
  // Suppress dropdown re-open immediately after selecting a suggestion
  const suppressSuggestionsRef = useRef(false);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    api
      .get("/profile", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((r) => {
        const { profile, familyMembers } = r.data;
        if (profile) {
          setShouldShowForm(true);
          setHasProfile(true);
          setForm({
            village: profile.village || "",
            name: profile.name || "",
            age: profile.age ?? "",
            currentAddress: profile.currentAddress || "",
            businessDetails: profile.businessDetails || "",
            phoneNumber: profile.phoneNumber || "",
            cityName: profile.cityName || "",
            businessType: profile.businessType || "",
            familyMembers: (familyMembers && familyMembers.length
              ? familyMembers
              : [emptyMember]
            ).map((m: any) => ({
              memberName: m.memberName || "",
              age: m.age ?? "",
              std: m.std ?? "",

              activityType: m.activityType || "અભ્યાસ",
              businessWorkType: m.businessWorkType || "",
              businessName: m.businessName || "",
              businessDescription: m.businessDescription || "",
              memberPhone: m.memberPhone || "",
              relation: m.relation || "",
              noneCategory: m.noneCategory || "",
            })),
          });
          setVillageQuery(profile.village || "");
          return;
        }
        setShouldShowForm(true);
        setHasProfile(false);
        setForm({
          village: "",
          name: "",
          age: "",
          currentAddress: "",
          businessDetails: "",
          phoneNumber: "",
          cityName: "",
          businessType: "",
          familyMembers: (familyMembers && familyMembers.length
            ? familyMembers
            : [emptyMember]
          ).map((m: any) => ({
            memberName: m.memberName || "",
            age: m.age ?? "",
            std: m.std ?? "",

            activityType: m.activityType || "અભ્યાસ",
            businessWorkType: m.businessWorkType || "",
            businessName: m.businessName || "",
            businessDescription: m.businessDescription || "",
            memberPhone: m.memberPhone || "",
            relation: m.relation || "",
            noneCategory: m.noneCategory || "",
          })),
        });
        setVillageQuery("");
      })
      .catch((err) => {
        const msg = err.response?.data?.message || err.message;
        setError(msg);
        setShouldShowForm(true);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const fetchVillages = async (term: string) => {
    try {
      setVillageLoading(true);
      const res = await api.get("/profile/villages");
      let raw = Array.isArray(res.data) ? res.data : res.data.villages || [];
      if (raw.length && typeof raw[0] === "string") {
        raw = raw.map((name: string) => name);
      } else if (raw.length && typeof raw[0] === "object") {
        raw = raw.map((v: any) => v.name);
      }
      const lower = term.toLowerCase();
      const filtered = lower
        ? raw.filter((n: string) => n.toLowerCase().includes(lower))
        : raw.slice(0, 10);
      setVillageSuggestions(filtered.slice(0, 10));
    } catch (e) {
      setVillageSuggestions([]);
    } finally {
      setVillageLoading(false);
    }
  };

  useEffect(() => {
    if (!shouldShowForm) return;
    if (villageDebounceRef.current)
      window.clearTimeout(villageDebounceRef.current);
    villageDebounceRef.current = window.setTimeout(() => {
      if (suppressSuggestionsRef.current) {
        suppressSuggestionsRef.current = false;
        return;
      }
      if (villageQuery.trim()) {
        fetchVillages(villageQuery.trim());
        setShowVillageSuggestions(true);
      } else {
        setVillageSuggestions([]);
        setShowVillageSuggestions(false);
      }
    }, 250);
    return () => {
      if (villageDebounceRef.current)
        window.clearTimeout(villageDebounceRef.current);
    };
  }, [villageQuery, shouldShowForm]);

  const villageWrapperRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!villageWrapperRef.current) return;
      if (!villageWrapperRef.current.contains(e.target as Node)) {
        setShowVillageSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectVillage = (name: string) => {
    suppressSuggestionsRef.current = true;
    setForm((f) => ({ ...f, village: name }));
    setVillageQuery(name);
    setShowVillageSuggestions(false);
  };

  const updateMember = (idx: number, patch: Partial<FamilyMemberForm>) => {
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    // Front-end validation: all fields mandatory (except image now optional)
    const errs: string[] = [];
    if (!form.village?.trim()) errs.push("village");
    if (!form.name?.trim()) errs.push("name");
    if (form.age === "" || form.age == null) errs.push("age");
    if (!form.cityName?.trim()) errs.push("cityName");
    if (!form.currentAddress?.trim()) errs.push("currentAddress");
    if (!form.businessDetails?.trim()) errs.push("businessDetails");
    if (!form.familyMembers.length) errs.push("at least one family member");
    form.familyMembers.forEach((m, i) => {
      if (!m.memberName.trim()) errs.push(`member ${i + 1} name`);
      const type = m.activityType || "અભ્યાસ";
      if (type === "અભ્યાસ") {
        if (m.age === "" || m.age == null) errs.push(`member ${i + 1} age`);
        if (!m.std?.trim()) errs.push(`member ${i + 1} std`);
        // Removed percentage validation for અભ્યાસ
      } else if (type === "વ્યવસાય") {
        if (m.age === "" || m.age == null) errs.push(`member ${i + 1} age`);
        if (!m.businessWorkType?.trim()) errs.push(`member ${i + 1} work type`);
        if (!m.businessName?.trim()) errs.push(`member ${i + 1} business name`);
        if (!m.businessDescription?.trim())
          errs.push(`member ${i + 1} business description`);
      } else if (type === "none") {
        if (m.age === "" || m.age == null) errs.push(`member ${i + 1} age`);
        if (!m.noneCategory?.trim()) errs.push(`member ${i + 1} none category`);
      }
    });
    if (errs.length) {
      setLoading(false);
      setError("કૃપા કરીને જરૂરી ફીલ્ડ્સ ભરો: " + errs.join(", "));
      return;
    }
    try {
      const payload = {
        village: form.village,
        name: form.name,
        age: form.age === "" ? undefined : form.age,
        currentAddress: form.currentAddress,
        businessDetails: form.businessDetails,
        phoneNumber: form.phoneNumber,
        cityName: form.cityName,
        businessType: form.businessType || undefined,
        familyMembers: form.familyMembers.map((m) => ({
          memberName: m.memberName,
          age: m.age === "" ? undefined : m.age,
          activityType: m.activityType || "અભ્યાસ",
          std: (m.activityType || "અભ્યાસ") === "અભ્યાસ" ? m.std : undefined,

          businessWorkType:
            m.activityType === "વ્યવસાય" ? m.businessWorkType : undefined,
          businessName:
            m.activityType === "વ્યવસાય" ? m.businessName : undefined,
          businessDescription:
            m.activityType === "વ્યવસાય" ? m.businessDescription : undefined,
          memberPhone: m.memberPhone?.trim() ? m.memberPhone : undefined,
          relation: m.relation?.trim() ? m.relation : undefined,
          noneCategory:
            m.activityType === "કોઈનહીં" ? m.noneCategory || undefined : undefined,
        })),
      };
      await api.post("/profile", payload);
      setHasProfile(true); // mark profile as completed
      // refresh profile cache so next page has fresh data
      try {
        await refetchProfile();
      } catch (e) {
        // ignore; navigation will still succeed
      }
      // After successful save, go to profile manage
      navigate("/profile-manage");
    } catch (err: any) {
      setError(err.response?.data?.message || "Error saving profile");
    } finally {
      setLoading(false);
    }
  };

  if (!shouldShowForm) {
    return loading ? <p>Loading...</p> : null;
  }

  return (
    <AuthCard title="Create Profile" subtitle="Enter your details" backTo="/">
      {hasProfile && (
        <div className="info-text" style={{ marginBottom: "0.75rem" }}>
          પ્રોફાઇલ પહેલેથી જ અસ્તિત્વમાં છે. તમે વિગતો અપડેટ કરી શકો છો અને ફરીથી સાચવી શકો છો.
        </div>
      )}
      <form onSubmit={submit} className="member-editor">
        {error && (
          <div className="field-error" style={{ marginBottom: "0.75rem" }}>
            {error}
          </div>
        )}
        <div
          className="logo-wrapper"
          style={{ textAlign: "center", marginBottom: "1rem" }}
        >
          <img
            src="/logo.svg"
            alt="Logo"
            style={{ height: "70px", width: "auto" }}
          />
        </div>
        <div
          className="autocomplete-wrapper"
          ref={villageWrapperRef}
          style={{ position: "relative" }}
        >
          <input
            className="input"
            placeholder="Village"
            value={villageQuery || form.village || ""}
            onChange={(e) => {
              const v = e.target.value;
              setVillageQuery(v);
              setForm((f) => ({ ...f, village: v }));
            }}
            onFocus={() => {
              if (villageSuggestions.length) setShowVillageSuggestions(true);
            }}
            onBlur={() => {
              const exact = villageSuggestions.find(
                (s) => s.toLowerCase() === (villageQuery || "").toLowerCase()
              );
              if (exact) selectVillage(exact);
              else setShowVillageSuggestions(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const exact = villageSuggestions.find(
                  (s) => s.toLowerCase() === (villageQuery || "").toLowerCase()
                );
                if (exact) {
                  e.preventDefault();
                  selectVillage(exact);
                }
              }
            }}
            autoComplete="off"
          />
          {showVillageSuggestions &&
            (villageLoading || villageSuggestions.length > 0) && (
              <ul
                className="autocomplete-list"
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  zIndex: 20,
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  background: "#fff",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  boxShadow: "var(--shadow-soft)",
                  maxHeight: 200,
                  overflowY: "auto",
                }}
              >
                {villageLoading && (
                  <li
                    className="autocomplete-item"
                    style={{
                      padding: "0.5rem 0.75rem",
                      fontSize: "0.8rem",
                      color: "var(--color-text-soft)",
                    }}
                  >
                    શોધી રહ્યું છે...
                  </li>
                )}
                {!villageLoading && villageSuggestions.length === 0 && (
                  <li
                    className="autocomplete-item"
                    style={{
                      padding: "0.5rem 0.75rem",
                      fontSize: "0.8rem",
                      color: "var(--color-text-soft)",
                    }}
                  >
                    કોઈ મેળ નથી.
                  </li>
                )}
                {!villageLoading &&
                  villageSuggestions.map((name) => (
                    <li
                      key={name}
                      className="autocomplete-item"
                      style={{ padding: "0.5rem 0.75rem", cursor: "pointer" }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        selectVillage(name);
                      }}
                    >
                      {name}
                    </li>
                  ))}
              </ul>
            )}
        </div>
        <input
          className="input"
          placeholder="નામ"
          value={form.name || ""}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <input
          className="input"
          placeholder="હાલનું સરનામું"
          value={form.currentAddress || ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, currentAddress: e.target.value }))
          }
        />
        <input
          className="input"
          placeholder="શહેરનું નામ"
          value={form.cityName || ""}
          onChange={(e) => setForm((f) => ({ ...f, cityName: e.target.value }))}
        />
        <input
          className="input"
          placeholder="ઉંમર"
          type="number"
          value={form.age || ""}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              age: e.target.value ? Number(e.target.value) : "",
            }))
          }
        />
        <select
          className="input"
          value={form.businessType || ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, businessType: e.target.value }))
          }
        >
          <option value="">વ્યવસાયનો પ્રકાર</option>
          <option value="વ્યક્તિગત">વ્યક્તિગત</option>
          <option value="નોકરી">નોકરી</option>
          <option value="કોઈ નહીં">કોઈ નહીં</option>
        </select>
        <textarea
          className="input"
          placeholder="વ્યવસાય વિગતો"
          value={form.businessDetails || ""}
          onChange={(e) =>
            setForm((f) => ({ ...f, businessDetails: e.target.value }))
          }
        />
        <div className="member-grid" style={{ marginTop: "0.5rem" }}>
          <strong style={{ gridColumn: "1 / -1" }}>પરિવારના સભ્યો</strong>
          {form.familyMembers.map((m, idx) => (
            <div key={idx} className="member-card">
              <h4>સભ્ય {idx + 1}</h4>
              <input
                className="input"
                placeholder="સભ્યનું નામ"
                value={m.memberName}
                onChange={(e) =>
                  updateMember(idx, { memberName: e.target.value })
                }
              />
              <select
                className="input"
                value={m.activityType || "અભ્યાસ"}
                onChange={(e) =>
                  updateMember(idx, { activityType: e.target.value })
                }
              >
                <option value="અભ્યાસ">અભ્યાસ</option>
                <option value="વ્યવસાય">વ્યવસાય</option>
                <option value="કોઈનહીં">કોઈ નહીં</option>
              </select>
              <div className="inline-actions">
                <input
                  className="input"
                  placeholder="ઉંમર"
                  type="number"
                  value={m.age || ""}
                  onChange={(e) =>
                    updateMember(idx, {
                      age: e.target.value ? Number(e.target.value) : "",
                    })
                  }
                />
                {(m.activityType || "અભ્યાસ") === "અભ્યાસ" && (
                  <input
                    className="input"
                    placeholder="ધોરણ"
                    value={m.std || ""}
                    onChange={(e) => updateMember(idx, { std: e.target.value })}
                  />
                )}
                {m.activityType === "વ્યવસાય" && (
                  <select
                    className="input"
                    value={m.businessWorkType || ""}
                    onChange={(e) =>
                      updateMember(idx, { businessWorkType: e.target.value })
                    }
                  >
                    <option value="">કામનો પ્રકાર</option>
                    <option value="વ્યક્તિગત">વ્યક્તિગત</option>
                    <option value="નોકરી">નોકરી</option>
                    <option value="કોઈનહીં">કોઈ નહીં</option>
                  </select>
                )}
              </div>

              {m.activityType === "વ્યવસાય" && (
                <>
                  <input
                    className="input"
                    placeholder="વ્યવસાય / નોકરીદાતાનું નામ"
                    value={m.businessName || ""}
                    onChange={(e) =>
                      updateMember(idx, { businessName: e.target.value })
                    }
                  />
                  <input
                    className="input"
                    placeholder="વ્યવસાયનું વર્ણન / ભૂમિકા"
                    value={m.businessDescription || ""}
                    onChange={(e) =>
                      updateMember(idx, { businessDescription: e.target.value })
                    }
                  />
                </>
              )}
              {m.activityType === "કોઈનહીં" && (
                <>
                  <select
                    className="input"
                    value={m.noneCategory || ""}
                    onChange={(e) =>
                      updateMember(idx, { noneCategory: e.target.value })
                    }
                  >
                    <option value="">શ્રેણી પસંદ કરો</option>
                    <option value="ગૃહિણી">ગૃહિણી</option>
                    <option value="નિવૃત્ત">નિવૃત્ત</option>
                    <option value="બાળક">બાળક</option>
                  </select>
                </>
              )}
              <input
                className="input"
                placeholder="સભ્ય નો ફોન નંબર (વૈકલ્પિક)"
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
                <option value="">સંબંધ</option>
                <option value="પિતા">પિતા</option>
                <option value="માતા">માતા</option>
                <option value="પત્ની">પત્ની</option>
                <option value="પુત્ર">પુત્ર</option>
                <option value="પુત્રી">પુત્રી</option>
                <option value="ભાઈ">ભાઈ</option>
                <option value="અન્ય">અન્ય</option>
              </select>
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
            સભ્ય ઉમેરો
          </button>
        </div>
        <div className="profile-actions">
          <button disabled={loading} className="btn btn-primary" type="submit">
            {loading ? "સાચવી રહ્યું છે..." : "સાચવો"}
          </button>
        </div>
      </form>
    </AuthCard>
  );
};
export default UserDetailsForm;
