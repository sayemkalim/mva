import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { endpoints } from "@/api/endpoints";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiService } from "@/api/api_service/apiService";
import { formatPhoneNumber } from "@/lib/utils";
import {
  User,
  Mail,
  Eye,
  EyeOff,
  Building2,
  Users,
  Loader2,
} from "lucide-react";

export function SignupForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    country_code_id: "",
    phone_number: "",
    firm_name: "",
    number_of_users: "",
    practice_area_id: "",
    password: "",
    password_confirmation: "",
    heard_about_us: "",
    timezone_id: "",
    terms_accepted: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Fetch signup metadata with response extraction
  const {
    data: metaData,
    isLoading: isLoadingMeta,
    isError,
    error,
  } = useQuery({
    queryKey: ["signupMeta"],
    queryFn: async () => {
      const response = await apiService({
        endpoint: endpoints.signupMeta,
        method: "GET",
        removeToken: true,
      });

      // console.log("Full API Response:", response);

      // Extract data from nested response
      const actualData = response.response || response;
      console.log("Extracted Data:", actualData);

      return actualData;
    },
  });

  console.log("Meta Data:", metaData);

  const countryCodes = metaData?.country_codes || [];
  const practiceAreas = metaData?.practice_areas || [];
  const timeZones = metaData?.TimeZone || [];

  console.log("Country Codes:", countryCodes);
  console.log("Practice Areas:", practiceAreas);
  console.log("Time Zones:", timeZones.length);

  // Set default country code when data loads
  useEffect(() => {
    if (countryCodes.length > 0 && !formData.country_code_id) {
      console.log("Setting default country code:", countryCodes[0]);
      setFormData((prev) => ({
        ...prev,
        country_code_id: countryCodes[0].id.toString(),
      }));
    }
  }, [countryCodes]);

  const signupMutation = useMutation({
    mutationFn: (data) =>
      apiService({
        endpoint: endpoints.signup,
        method: "POST",
        data,
        removeToken: true,
      }),
    onSuccess: (data) => {
      console.log("Signup response:", data);

      const apiStatus =
        data?.Apistatus ||
        data?.ApiApistatus ||
        data?.response?.Apistatus ||
        data?.response?.ApiApistatus;

      if (apiStatus === true) {
        const message =
          data?.message ||
          data?.response?.message ||
          "Account created successfully!";
        toast.success(message);
        setValidationErrors({});

        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      } else {
        const errors = data?.errors || data?.response?.errors || {};
        const message =
          data?.message || data?.response?.message || "Signup failed";

        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
          Object.entries(errors).forEach(([field, messages]) => {
            const errorMessages = Array.isArray(messages)
              ? messages.join(", ")
              : messages;
            toast.error(`${field}: ${errorMessages}`);
          });
        } else {
          toast.error(message);
        }
      }
    },

    onError: (error) => {
      console.error("Signup error:", error);

      const errors = error?.response?.data?.errors || {};
      const message =
        error?.response?.data?.message || "Signup failed. Please try again.";

      setValidationErrors(errors);

      if (Object.keys(errors).length > 0) {
        toast.error(message);
        Object.entries(errors).forEach(([field, messages]) => {
          const errorMessages = Array.isArray(messages)
            ? messages.join(", ")
            : messages;
          toast.error(`${field}: ${errorMessages}`);
        });
      } else {
        toast.error(message);
      }
    },
  });

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    let processedValue = value;
    if (id === "phone_number") {
      processedValue = formatPhoneNumber(value);
    }

    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : processedValue,
    });

    if (validationErrors[id]) {
      setValidationErrors({
        ...validationErrors,
        [id]: undefined,
      });
    }
  };

  const handleSelectChange = (name, value) => {
    console.log(`Select changed: ${name} = ${value}`);
    setFormData({ ...formData, [name]: value });

    if (validationErrors[name]) {
      setValidationErrors({
        ...validationErrors,
        [name]: undefined,
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.first_name.trim()) errors.first_name = "First name is required";
    if (!formData.last_name.trim()) errors.last_name = "Last name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = "Invalid email format";

    if (!formData.country_code_id) errors.country_code_id = "Code required";
    if (!formData.phone_number.trim()) errors.phone_number = "Phone number is required";

    if (!formData.firm_name.trim()) errors.firm_name = "Firm name is required";
    if (!formData.number_of_users) errors.number_of_users = "Number of users is required";
    if (!formData.practice_area_id) errors.practice_area_id = "Practice area is required";
    if (!formData.timezone_id) errors.timezone_id = "Timezone is required";

    if (!formData.password) errors.password = "Password is required";
    else if (formData.password.length < 6) errors.password = "Password must be at least 6 characters";

    if (!formData.password_confirmation) errors.password_confirmation = "Password confirmation is required";
    else if (formData.password !== formData.password_confirmation) errors.password_confirmation = "Passwords do not match";

    if (!formData.terms_accepted) errors.terms_accepted = "Please accept the terms and conditions";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const submissionData = {
      ...formData,
      number_of_users: parseInt(formData.number_of_users),
      practice_area_id: parseInt(formData.practice_area_id),
      country_code_id: parseInt(formData.country_code_id),
      timezone_id: formData.timezone_id
        ? parseInt(formData.timezone_id)
        : undefined,
    };

    console.log("Submitting:", submissionData);
    signupMutation.mutate(submissionData);
  };

  const getFieldError = (fieldName) => {
    const error = validationErrors[fieldName];
    if (!error) return null;
    return Array.isArray(error) ? error[0] : error;
  };

  if (isLoadingMeta) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading Meta Data</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <p className="text-sm text-red-500">
          Error loading form: {error?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your details below to create your account
        </p>
      </div>

      <div className="grid gap-6">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-3">
            <Label htmlFor="first_name">First Name <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                id="first_name"
                type="text"
                placeholder="John"
                value={formData.first_name}
                onChange={handleChange}
                className={`pr-10 ${getFieldError("first_name") ? "border-red-500" : ""
                  }`}
                required
              />
              <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {getFieldError("first_name") && (
              <p className="text-red-500 text-sm">
                {getFieldError("first_name")}
              </p>
            )}
          </div>

          <div className="grid gap-3">
            <Label htmlFor="last_name">Last Name <span className="text-red-500">*</span></Label>
            <Input
              id="last_name"
              type="text"
              placeholder="Doe"
              value={formData.last_name}
              onChange={handleChange}
              className={getFieldError("last_name") ? "border-red-500" : ""}
              required
            />
            {getFieldError("last_name") && (
              <p className="text-red-500 text-sm">
                {getFieldError("last_name")}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="grid gap-3">
          <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={formData.email}
              onChange={handleChange}
              className={`pr-10 ${getFieldError("email") ? "border-red-500" : ""
                }`}
              required
            />
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          {getFieldError("email") && (
            <p className="text-red-500 text-sm font-medium">
              {getFieldError("email") === "INACTIVE_EMAIL"
                ? "This email is inactive. Please verify your email or use a different one."
                : getFieldError("email")}
            </p>
          )}
        </div>

        {/* Phone Number with Country Code */}
        <div className="grid gap-3">
          <Label>Phone Number <span className="text-red-500">*</span></Label>
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-2">
              <Select
                value={formData.country_code_id}
                onValueChange={(value) =>
                  handleSelectChange("country_code_id", value)
                }
              >
                <SelectTrigger
                  className={`w-full overflow-hidden whitespace-nowrap ${getFieldError("country_code_id") ? "border-red-500" : ""
                    }`}
                >
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                  {countryCodes.map((country) => (
                    <SelectItem key={country.id} value={country.id.toString()}>
                      {country.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-3">
              <Input
                id="phone_number"
                type="tel"
                placeholder="9999999999"
                value={formData.phone_number}
                onChange={handleChange}
                className={
                  getFieldError("phone_number") ? "border-red-500" : ""
                }
                required
              />
            </div>
          </div>
          {getFieldError("phone_number") && (
            <p className="text-red-500 text-sm">
              {getFieldError("phone_number")}
            </p>
          )}
        </div>

        {/* Firm Name */}
        <div className="grid gap-3">
          <Label htmlFor="firm_name">Firm Name <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Input
              id="firm_name"
              type="text"
              placeholder="Your Firm Name"
              value={formData.firm_name}
              onChange={handleChange}
              className={`pr-10 ${getFieldError("firm_name") ? "border-red-500" : ""
                }`}
              required
            />
            <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          {getFieldError("firm_name") && (
            <p className="text-red-500 text-sm">{getFieldError("firm_name")}</p>
          )}
        </div>

        {/* Number of Users & Practice Area */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-3">
            <Label htmlFor="number_of_users">Number of Users <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                id="number_of_users"
                type="number"
                placeholder="10"
                min="1"
                value={formData.number_of_users}
                onChange={handleChange}
                className={`pr-10 ${getFieldError("number_of_users") ? "border-red-500" : ""
                  }`}
                required
              />
              <Users className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {getFieldError("number_of_users") && (
              <p className="text-red-500 text-sm">
                {getFieldError("number_of_users")}
              </p>
            )}
          </div>

          <div className="grid gap-3">
            <Label>Practice Area <span className="text-red-500">*</span></Label>
            <Select
              value={formData.practice_area_id}
              onValueChange={(value) =>
                handleSelectChange("practice_area_id", value)
              }
            >
              <SelectTrigger
                className={`w-full overflow-hidden whitespace-nowrap ${getFieldError("practice_area_id") ? "border-red-500" : ""
                  }`}
              >
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent>
                {practiceAreas.map((area) => (
                  <SelectItem key={area.id} value={area.id.toString()}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {getFieldError("practice_area_id") && (
              <p className="text-red-500 text-sm">
                {getFieldError("practice_area_id")}
              </p>
            )}
          </div>
        </div>

        {/* TimeZone Field */}
        <div className="grid gap-3">
          <Label>TimeZone <span className="text-red-500">*</span></Label>
          <Select
            value={formData.timezone_id}
            onValueChange={(value) => handleSelectChange("timezone_id", value)}
          >
            <SelectTrigger
              className={`w-full overflow-hidden whitespace-nowrap ${getFieldError("timezone_id") ? "border-red-500" : ""}`}
            >
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {timeZones.map((tz) => (
                <SelectItem key={tz.id} value={tz.id.toString()}>
                  {tz.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {getFieldError("timezone_id") && (
            <p className="text-red-500 text-sm">
              {getFieldError("timezone_id")}
            </p>
          )}
        </div>

        {/* Password Fields */}
        <div className="grid gap-3">
          <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              className={`pr-10 ${getFieldError("password") ? "border-red-500" : ""
                }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {getFieldError("password") && (
            <p className="text-red-500 text-sm">{getFieldError("password")}</p>
          )}
        </div>

        <div className="grid gap-3">
          <Label htmlFor="password_confirmation">Confirm Password <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Input
              id="password_confirmation"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter password"
              value={formData.password_confirmation}
              onChange={handleChange}
              className={`pr-10 ${getFieldError("password_confirmation") ? "border-red-500" : ""
                }`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {getFieldError("password_confirmation") && (
            <p className="text-red-500 text-sm">
              {getFieldError("password_confirmation")}
            </p>
          )}
        </div>

        {/* Heard About Us */}
        <div className="grid gap-3">
          <Label htmlFor="heard_about_us">How did you hear about us?</Label>
          <Input
            id="heard_about_us"
            type="text"
            placeholder="e.g., Google, Friend, etc."
            value={formData.heard_about_us}
            onChange={handleChange}
            className={getFieldError("heard_about_us") ? "border-red-500" : ""}
          />
          {getFieldError("heard_about_us") && (
            <p className="text-red-500 text-sm">
              {getFieldError("heard_about_us")}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms_accepted"
              checked={formData.terms_accepted}
              onCheckedChange={(checked) => {
                setFormData({ ...formData, terms_accepted: checked });
                if (checked && validationErrors.terms_accepted) {
                  setValidationErrors({ ...validationErrors, terms_accepted: undefined });
                }
              }}
              className={getFieldError("terms_accepted") ? "border-red-500" : ""}
            />
            <Label
              htmlFor="terms_accepted"
              className="text-sm font-normal cursor-pointer"
            >
              I accept the{" "}
              <a href="/terms" className="underline hover:text-primary">
                terms and conditions
              </a>
              <span className="text-red-500 ml-1">*</span>
            </Label>
          </div>
          {getFieldError("terms_accepted") && (
            <p className="text-red-500 text-sm mt-1">
              {getFieldError("terms_accepted")}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={signupMutation.isPending}
        >
          {signupMutation.isPending ? "Creating account..." : "Sign up"}
        </Button>
      </div>
    </form>
  );
}
