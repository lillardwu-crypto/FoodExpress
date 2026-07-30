import {
    useEffect,
    useState,
} from "react";

const INITIAL_FORM_DATA = {
    label: "",
    recipientName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
};

function AddressForm({
    initialData = INITIAL_FORM_DATA,
    submitLabel = "Save address",
    onSubmit,
    isSubmitting = false,
    serverError = "",
}) {
    const [formData, setFormData] = useState({
        ...INITIAL_FORM_DATA,
        ...initialData,
    });

    const [validationErrors, setValidationErrors] =
        useState({});

    useEffect(() => {
        setFormData({
            ...INITIAL_FORM_DATA,
            ...initialData,
        });
    }, [initialData]);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((currentFormData) => ({
            ...currentFormData,
            [name]: value,
        }));

        setValidationErrors((currentErrors) => ({
            ...currentErrors,
            [name]: "",
        }));
    }

    function validateForm() {
        const errors = {};

        if (!formData.label.trim()) {
            errors.label =
                "Address label is required.";
        }

        if (!formData.recipientName.trim()) {
            errors.recipientName =
                "Recipient name is required.";
        }

        if (!formData.phone.trim()) {
            errors.phone =
                "Phone number is required.";
        }

        if (!formData.street.trim()) {
            errors.street =
                "Street address is required.";
        }

        if (!formData.city.trim()) {
            errors.city =
                "City is required.";
        }

        if (!formData.state.trim()) {
            errors.state =
                "State is required.";
        }

        if (!formData.zipCode.trim()) {
            errors.zipCode =
                "ZIP code is required.";
        }

        setValidationErrors(errors);

        return Object.keys(errors).length === 0;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        const normalizedAddress = {
            label: formData.label.trim(),

            recipientName:
                formData.recipientName.trim(),

            phone: formData.phone.trim(),

            street: formData.street.trim(),

            city: formData.city.trim(),

            state: formData.state
                .trim()
                .toUpperCase(),

            zipCode: formData.zipCode.trim(),
        };

        await onSubmit(normalizedAddress);
    }

    return (
        <form
            className="address-form"
            onSubmit={handleSubmit}
            noValidate
        >
            {serverError && (
                <div className="address-form-server-error">
                    {serverError}
                </div>
            )}

            <div className="address-form-field">
                <label htmlFor="label">
                    Address label
                </label>

                <input
                    id="label"
                    name="label"
                    type="text"
                    value={formData.label}
                    onChange={handleChange}
                    placeholder="Home, Work, Apartment..."
                    autoComplete="off"
                />

                {validationErrors.label && (
                    <p className="address-field-error">
                        {validationErrors.label}
                    </p>
                )}
            </div>

            <div className="address-form-field">
                <label htmlFor="recipientName">
                    Recipient name
                </label>

                <input
                    id="recipientName"
                    name="recipientName"
                    type="text"
                    value={formData.recipientName}
                    onChange={handleChange}
                    placeholder="Full name"
                    autoComplete="name"
                />

                {validationErrors.recipientName && (
                    <p className="address-field-error">
                        {
                            validationErrors.recipientName
                        }
                    </p>
                )}
            </div>

            <div className="address-form-field">
                <label htmlFor="phone">
                    Phone number
                </label>

                <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="6175551234"
                    autoComplete="tel"
                />

                {validationErrors.phone && (
                    <p className="address-field-error">
                        {validationErrors.phone}
                    </p>
                )}
            </div>

            <div className="address-form-field">
                <label htmlFor="street">
                    Street address
                </label>

                <input
                    id="street"
                    name="street"
                    type="text"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="181 Washington St"
                    autoComplete="street-address"
                />

                {validationErrors.street && (
                    <p className="address-field-error">
                        {validationErrors.street}
                    </p>
                )}
            </div>

            <div className="address-form-row">
                <div className="address-form-field">
                    <label htmlFor="city">
                        City
                    </label>

                    <input
                        id="city"
                        name="city"
                        type="text"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Boston"
                        autoComplete="address-level2"
                    />

                    {validationErrors.city && (
                        <p className="address-field-error">
                            {validationErrors.city}
                        </p>
                    )}
                </div>

                <div className="address-form-field">
                    <label htmlFor="state">
                        State
                    </label>

                    <input
                        id="state"
                        name="state"
                        type="text"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="MA"
                        maxLength={2}
                        autoComplete="address-level1"
                    />

                    {validationErrors.state && (
                        <p className="address-field-error">
                            {validationErrors.state}
                        </p>
                    )}
                </div>

                <div className="address-form-field">
                    <label htmlFor="zipCode">
                        ZIP code
                    </label>

                    <input
                        id="zipCode"
                        name="zipCode"
                        type="text"
                        value={formData.zipCode}
                        onChange={handleChange}
                        placeholder="02135"
                        autoComplete="postal-code"
                    />

                    {validationErrors.zipCode && (
                        <p className="address-field-error">
                            {validationErrors.zipCode}
                        </p>
                    )}
                </div>
            </div>

            <button
                type="submit"
                className="address-submit-button"
                disabled={isSubmitting}
            >
                {isSubmitting
                    ? "Saving..."
                    : submitLabel}
            </button>
        </form>
    );
}

export default AddressForm;