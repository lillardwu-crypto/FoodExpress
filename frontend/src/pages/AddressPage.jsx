import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    deleteAddress,
    getAddresses,
    setDefaultAddress,
} from "../api/addressApi";
import AddressCard from "../components/AddressCard";
import "./AddressPage.css";

function AddressPage() {
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        async function loadAddresses() {
            try {
                setIsLoading(true);
                setErrorMessage("");

                const data = await getAddresses();

                setAddresses(
                    Array.isArray(data) ? data : []
                );
            } catch (error) {
                console.error(
                    "Failed to load addresses:",
                    error
                );

                if (
                    error.response?.status === 401 ||
                    error.response?.status === 403
                ) {
                    setErrorMessage(
                        "Please log in to view your saved addresses."
                    );
                } else {
                    setErrorMessage(
                        error.response?.data?.message ||
                            "Unable to load addresses. Please try again."
                    );
                }
            } finally {
                setIsLoading(false);
            }
        }

        loadAddresses();
    }, []);

    async function handleDelete(addressId) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this address?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setErrorMessage("");

            await deleteAddress(addressId);

            setAddresses((currentAddresses) =>
                currentAddresses.filter(
                    (address) =>
                        address.addressId !== addressId
                )
            );
        } catch (error) {
            console.error(
                "Failed to delete address:",
                error
            );

            setErrorMessage(
                error.response?.data?.message ||
                    "Unable to delete address. Please try again."
            );
        }
    }

    async function handleSetDefault(addressId) {
        try {
            setErrorMessage("");
    
            const updatedAddress =
                await setDefaultAddress(addressId);
    
            setAddresses((currentAddresses) =>
                currentAddresses.map((address) => ({
                    ...address,
                    defaultAddress:
                        address.addressId ===
                        updatedAddress.addressId,
                }))
            );
        } catch (error) {
            console.error(
                "Failed to set default address:",
                error
            );
    
            setErrorMessage(
                error.response?.data?.message ||
                    "Unable to set default address. Please try again."
            );
        }
    }

    return (
        <main className="address-page">
            <div className="address-page-container">
                <header className="address-page-header">
                    <div className="address-page-heading">
                        <Link
                            to="/account"
                            className="address-back-link"
                        >
                            <span>←</span>
                            <span>Back to account</span>
                        </Link>

                        <h1>Saved addresses</h1>

                        <p>
                            Manage the addresses used for your orders.
                        </p>
                    </div>

                    <Link
                        to="/account/addresses/new"
                        className="add-address-button"
                    >
                        Add address
                    </Link>
                </header>

                {isLoading && (
                    <div className="address-state">
                        <div className="address-loading-spinner" />
                        <p>Loading your addresses...</p>
                    </div>
                )}

                {!isLoading && errorMessage && (
                    <div className="address-error">
                        <h2>Something went wrong</h2>
                        <p>{errorMessage}</p>
                    </div>
                )}

                {!isLoading &&
                    !errorMessage &&
                    addresses.length === 0 && (
                        <div className="address-empty-state">
                            <div className="address-empty-icon">
                                ⌂
                            </div>

                            <h2>No saved addresses yet</h2>

                            <p>
                                Add an address to make checkout faster.
                            </p>

                            <Link
                                to="/account/addresses/new"
                                className="empty-add-address-button"
                            >
                                Add your first address
                            </Link>
                        </div>
                    )}

                {!isLoading &&
                    !errorMessage &&
                    addresses.length > 0 && (
                        <section className="address-list">
                            {addresses.map((address) => (
                                <AddressCard
                                    key={address.addressId}
                                    address={address}
                                    onDelete={handleDelete}
                                    onSetDefault={handleSetDefault}
                                />
                            ))}
                        </section>
                    )}
            </div>
        </main>
    );
}

export default AddressPage;