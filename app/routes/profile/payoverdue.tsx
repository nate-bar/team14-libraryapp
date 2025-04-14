import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/uiOverdueBal/card";
import { Input } from "../../components/uiOverdueBal/input";
import { Button } from "../../components/uiOverdueBal/button";
import { Label } from "../../components/uiOverdueBal/label";
import { useOutletContext } from "react-router";
import { type AuthData } from "~/services/api";
import ProfilePage from "./profile";

interface PaymentInfo {
    cardNumber: string;
    expiration: string;
    cvc: string;
  }
  
  const PayOverdueBalance: React.FC = () => {
    const [libraryCard, setLibraryCard] = useState("");
    const [amount, setAmount] = useState("");
    const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
      cardNumber: "",
      expiration: "",
      cvc: "",
    });
    const [message, setMessage] = useState("");
  
    const handlePayment = () => {
      const payAmount = parseFloat(amount);
  
      if (!libraryCard || isNaN(payAmount) || payAmount <= 0) {
        setMessage("Please enter valid card number and amount.");
        return;
      }
  
      if (!/^\d{16}$/.test(paymentInfo.cardNumber)) {
        setMessage("Invalid credit card number.");
        return;
      }
  
      if (!/^\d{3,4}$/.test(paymentInfo.cvc)) {
        setMessage("Invalid CVC.");
        return;
      }
  
      // Simulate payment success
      setMessage(`Payment of $${payAmount.toFixed(2)} successful for card ending in ${paymentInfo.cardNumber.slice(-4)}.`);
      setAmount("");
      setPaymentInfo({ cardNumber: "", expiration: "", cvc: "" });
      setLibraryCard("");
    };
  
    return (
      <div className="max-w-md mx-auto p-6">
        <Card className="shadow-md">
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-bold text-center">Pay Overdue Balance</h2>
  
            <div className="space-y-2">
              <Label htmlFor="libraryCard">Please enter your Member ID</Label>
              <Input
                id="libraryCard"
                value={libraryCard}
                onChange={(e) => setLibraryCard(e.target.value)}
                placeholder="Enter library card number"
              />
            </div>
  
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Pay ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 10.00"
              />
            </div>
  
            <hr className="my-4" />
  
            <h3 className="font-semibold">Credit Card Info</h3>
  
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                maxLength={16}
                value={paymentInfo.cardNumber}
                onChange={(e) =>
                  setPaymentInfo({ ...paymentInfo, cardNumber: e.target.value })
                }
                placeholder="1234 5678 9012 3456"
              />
            </div>
  
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="expiration">Expiration</Label>
                <Input
                  id="expiration"
                  placeholder="MM/YY"
                  value={paymentInfo.expiration}
                  onChange={(e) =>
                    setPaymentInfo({ ...paymentInfo, expiration: e.target.value })
                  }
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  maxLength={4}
                  value={paymentInfo.cvc}
                  onChange={(e) =>
                    setPaymentInfo({ ...paymentInfo, cvc: e.target.value })
                  }
                  placeholder="123"
                />
              </div>
            </div>
  
            <Button className="w-full mt-4" onClick={handlePayment}>
              Submit Payment
            </Button>
  
            {message && (
              <p className="text-center text-blue-600 font-medium mt-4">{message}</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };
  
  export default PayOverdueBalance;