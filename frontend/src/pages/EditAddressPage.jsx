import {
    useEffect,
    useState,
} from "react";

import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    getAddresses,
    updateAddress,
} from "../api/addressApi";

import AddressForm from "../components/AddressForm";
import "./AddressFormPage.css";

function EditAddressPage() {
    const navigate = useNavigate();

    const { addressId } = useParams();

    const [address, setAddress] =
        useState(null);

    const [isLoading, setIsLoading] =
        useState(true);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [serverError, setServerError] =
        useState("");

    useEffect(() => {
        async function loadAddress() {
            try {
                setIsLoading(true);
                setServerError("");

                const addresses =
                    await getAddresses();

                const selectedAddress =
                    addresses.find(
                        (item) =>
                            String(
                                item.id ??
                                    item.addressId
                            ) ===
                            String(addressId)
                    );

                if (!selectedAddress) {
                    setServerError(
                        "Address not found."
                    );

                    return;
                }

                setAddress(selectedAddress);
            } catch (error) {
                console.error(
                    "Failed to load address:",
                    error
                );

                setServerError(
                    error.response?.data?.message ||
                        "Unable to load this address."
                );
            } finally {
                setIsLoading(false);
            }
        }

        loadAddress();
    }, [addressId]);

    async function handleUpdateAddress(
        addressData
    ) {
        try {
            setIsSubmitting(true);
            setServerError("");

            const currentAddressId =
                address?.id ??
                address?.addressId;

            console.log(
                "Route address ID:",
                addressId
            );

            console.log(
                "Loaded address:",
                address
            );

            console.log(
                "Actual update address ID:",
                currentAddressId
            );

            if (!currentAddressId) {
                setServerError(
                    "Unable to determine the address ID."
                );

                return;
            }

            await updateAddress(
                currentAddressId,
                addressData
            );

            navigate("/account/addresses");
        } catch (error) {
            console.error(
                "Failed to update address:",
                error
            );

            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {
                setServerError(
                    "Your session has expired. Please log in again."
                );

                return;
            }

            if (error.response?.status === 404) {
                setServerError(
                    "This address could not be found."
                );

                return;
            }

            setServerError(
                error.response?.data?.message ||
                    "Unable to update this address."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <main className="address-form-page">
                <div className="address-form-page-container">
                    <div className="address-state">
                        <div className="address-loading-spinner" />

                        <p>
                            Loading address...
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    if (!address) {
        return (
            <main className="address-form-page">
                <div className="address-form-page-container">
                    <Link
                        to="/account/addresses"
                        className="address-form-back-link"
                    >
                        ← Back to saved addresses
                    </Link>

                    <div className="address-error">
                        <h2>
                            Unable to edit address
                        </h2>

                        <p>
                            {serverError}
                        </p>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="address-form-page">
            <div className="address-form-page-container">
                <Link
                    to="/account/addresses"
                    className="address-form-back-link"
                >
                    ← Back to saved addresses
                </Link>

                <header className="address-form-page-header">
                    <h1>
                        Edit address
                    </h1>

                    <p>
                        Update the delivery details
                        for this address.
                    </p>
                </header>

                <section className="address-form-card">
                    <AddressForm
                        initialData={address}
                        submitLabel="Update address"
                        onSubmit={
                            handleUpdateAddress
                        }
                        isSubmitting={
                            isSubmitting
                        }
                        serverError={
                            serverError
                        }
                    />
                </section>
            </div>
        </main>
    );
}

export default EditAddressPage;