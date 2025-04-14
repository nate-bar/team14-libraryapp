import { useState, useEffect } from "react";
import { useOutletContext } from "react-router";
import { type AuthData } from "~/services/api";
import LoadingSpinner from "~/components/loadingspinner";
import "./payoverdue.css";

export default function PayOverdue() {
  const authData = useOutletContext<AuthData>();
  const [fineAmount, setFineAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Fake credit card fields
  const [cardName, setCardName] = useState("");
  //const [cardNumber, setCardNumber] = useState("");
  //const [expiry, setExpiry] = useState("");
  //const [cvv, setCvv] = useState("");
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  useEffect(() => {
    const fetchFineAmount = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/fines/${authData.memberID}`);
        if (!response.ok) {
          throw new Error("Failed to fetch fine amount");
        }
        const data = await response.json();
        console.log("Fine data received:", data);
        setFineAmount(data.FineAmount);
        setError(null);
      } catch (err) {
        console.error("Error fetching fine amount:", err);
        setError("Could not load fine amount. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFineAmount();
  }, [authData.memberID]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    const payAmount = parseFloat(paymentAmount);

    // Frontend validations
    if (!authData?.memberID || isNaN(payAmount) || payAmount <= 0) {
      setError("Invalid member or amount.");
      return;
    }

    if (!/^\d{16}$/.test(paymentInfo.cardNumber)) {
      setError("Invalid credit card number.");
      return;
    }

    if (!/^\d{3,4}$/.test(paymentInfo.cvc)) {
      setError("Invalid CVC.");
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentInfo.expiry)) {
      setError("Invalid expiry date. Use MM/YY format.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memberID: authData.memberID,
          amount: payAmount,
          //cardInfo: paymentInfo, // You can ignore it on the server, but this simulates a real flow
        }),
      });

      if (!response.ok) {
        throw new Error("Payment failed");
      }

      const data = await response.json();
      if (data.success) {
        setPaymentSuccess(true);
        setFineAmount(0);
        setError(null);
      } else {
        setError("Payment unsuccessful.");
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      setError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | null): string => {
    if (amount === null) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h2 className="text-2xl font-bold mb-4">Pay Overdue Fines</h2>

      {paymentSuccess ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Payment successful! Thank you for paying your fines.
        </div>
      ) : (
        <>
          <div className="current-balance mb-6">
            <strong>Outstanding Balance:</strong> {formatCurrency(fineAmount)}
          </div>

          {fineAmount && fineAmount > 0 ? (
            <form onSubmit={handlePayment} className="payment-form">
              <div className="form-group mb-4">
                <label htmlFor="paymentAmount" className="block mb-2">
                  Payment Amount:
                </label>
                <input
                  type="number"
                  id="paymentAmount"
                  min="0.01"
                  max={fineAmount}
                  step="0.01"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
                <small className="text-gray-500">
                  Maximum payment: {formatCurrency(fineAmount)}
                </small>
              </div>

              <div className="form-group mb-4">
                <label className="block mb-2">Cardholder Name:</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="form-group mb-4">
                <label className="block mb-2">Card Number:</label>
                <input
                  type="text"
                  id="cardNumber"
                  maxLength={16}
                  value={paymentInfo.cardNumber}
                  onChange={(e) =>
                    setPaymentInfo({
                      ...paymentInfo,
                      cardNumber: e.target.value,
                    })
                  }
                  className="w-full p-2 border rounded"
                  required
                />
              </div>

              <div className="form-group mb-4 flex gap-4">
                <div className="flex-1">
                  <label className="block mb-2">Expiry Date (MM/YY):</label>
                  <input
                    type="text"
                    id="expiry"
                    value={paymentInfo.expiry}
                    onChange={(e) =>
                      setPaymentInfo({ ...paymentInfo, expiry: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-2">CVV:</label>
                  <input
                    type="text"
                    id="cvc"
                    maxLength={4}
                    value={paymentInfo.cvc}
                    onChange={(e) =>
                      setPaymentInfo({ ...paymentInfo, cvc: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Submit Payment
              </button>
            </form>
          ) : (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              You don't have any outstanding fines. Thank you!
            </div>
          )}
        </>
      )}

      <div className="mt-6">
        <a href="./dashboard" className="text-blue-500 hover:underline">
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
