import React from "react";

import { PARAMETERS_CREDIT, CURRENCIES, MORTGAGE, CAR, MATERNAL_CAPITAL, DURATION_UNITS }  from '../const'
import { addSpaces, getSumInitialFee, getDurationUnit, deleteLine }  from '../utils'


const { useState, createContext, useContext, useEffect } = React

const CreditCalculatorContext = createContext();

export function useCreditCalculatorContext() {
    const context = useContext(CreditCalculatorContext);

    if (context === undefined) {
        throw new Error('useCreditCalculatorContext must be used within the CreditCalculatorContextProvider');
    }

    return context;
}

const defaultParameters = { type: '', price: { defaultValue: ""}, initialFee: { min: 0, max: 0 }, minSize: 0, duration: '', interestRate: 0};

export default function CreditCalculatorContextProvider ({ children }) {
  const [parameters, setParameters] = useState(defaultParameters);

  const [typeCredit, setTypeCredit] = useState(null)
  const [monthlyPayment, setMonthlyPayment] = useState(0);
  const [isOfferRequestFormOpen, setIsOfferRequestFormOpen] = useState(false);
  const [isOfferOpen, setIOfferOpen] = useState(false);
  const [amountCredit, setAmountCredit] = useState(null);
  const [isValidPrice, setIsValidPrice] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(addSpaces(parameters.price.defaultValue) + CURRENCIES[0]);
  const [sumInitialFee, setSumInitialFee] = useState(addSpaces(getSumInitialFee(currentPrice, parameters.initialFee.min)) + CURRENCIES);
  const [currentDuration, setCurrentDuration] = useState(parameters.duration.min + getDurationUnit(parameters.duration.min));
  const [currentInterestRate, setCurrentInterestRate] = useState(parameters.interestRate.max);
  const [isCapital, setIsCapital] = useState(false);
  const [isCarInsurance, setIsCarInsurance] = useState(false);
  const [isLifeInsurance, setIsLifeInsurance] = useState(false);
  const [rateInitialFee, setRateInitialFee] = useState(parameters.initialFee.min);

  useEffect(() => {
   setParameters(PARAMETERS_CREDIT[typeCredit] || defaultParameters);
  }, [typeCredit]);

  useEffect(() => {
    setMonthlyPayment('');
    setIsOfferRequestFormOpen(false);
    setAmountCredit(``);
    setIsValidPrice(true);
    setCurrentPrice(addSpaces(parameters.price.defaultValue) + CURRENCIES[0]);
    setSumInitialFee(addSpaces(getSumInitialFee(currentPrice, parameters.initialFee.min)) + CURRENCIES);
    setCurrentDuration(parameters.duration.min + getDurationUnit(parameters.duration.min));
    setCurrentInterestRate(parameters.interestRate.max);
    setIsCapital(parameters.type === MORTGAGE.type);
    setIsCarInsurance(parameters.type === CAR.type);
    setIsLifeInsurance(parameters.type === CAR.type);
    setRateInitialFee(parameters.initialFee.min);
  }, [parameters]);

  useEffect(() => {
    setSumInitialFee(addSpaces(getSumInitialFee(currentPrice, rateInitialFee)) + CURRENCIES[0]); 

    const numPrice = Number(deleteLine(currentPrice, CURRENCIES));

    if (numPrice) {
      setIsValidPrice(numPrice >= parameters.price.min && numPrice <= parameters.price.max) 
    }
  }, [currentPrice, rateInitialFee]);

  useEffect(() => {
    if (parameters.type === CAR.type) {
        if (isCarInsurance && isLifeInsurance) {
            setCurrentInterestRate(parameters.interestRate[3])
        } else if(isCarInsurance || isLifeInsurance){
            setCurrentInterestRate(parameters.interestRate[2])
        } else if(Number(deleteLine(currentPrice, CURRENCIES)) >= CAR.priceChangingInterestRate){
            setCurrentInterestRate(parameters.interestRate[1])
        } else {
            setCurrentInterestRate(parameters.interestRate[0])
        }
    }
  }, [isCarInsurance, isLifeInsurance]);

  useEffect(() => {
    const rate = (currentInterestRate/100/12);
    setMonthlyPayment(Math.round(amountCredit * (rate/(1-(Math.pow(1+rate, -(deleteLine(currentDuration, DURATION_UNITS)*12)))))))
  }, [currentInterestRate, amountCredit, currentDuration]);

  useEffect(() => {    
    const price = Number(deleteLine(currentPrice, CURRENCIES));
    const initialFee = Number(deleteLine(sumInitialFee, CURRENCIES));
    setAmountCredit( isCapital ? Math.round(price-initialFee-MATERNAL_CAPITAL): Math.round(price-initialFee));
  }, [currentPrice, sumInitialFee, isCapital]);
  
  useEffect(() => {
    if (parameters.type === MORTGAGE.type) {
      setCurrentInterestRate(rateInitialFee < MORTGAGE.rateInitialFeeChangingInterestRate ? parameters.interestRate[0] : parameters.interestRate[1])
    }
  }, [rateInitialFee]);

    const contextValue = {
        typeCredit,
        setTypeCredit,
        parameters,
        setParameters,
        setCurrentPrice,
        setIsValidPrice,
        setSumInitialFee,
        setAmountCredit,
        setCurrentDuration,
        setCurrentInterestRate,
        setMonthlyPayment,
        currentPrice,
        isValidPrice,
        sumInitialFee,
        amountCredit,
        currentDuration,
        currentInterestRate,
        monthlyPayment,
        isOfferRequestFormOpen,
        setIsOfferRequestFormOpen,
        isOfferOpen, 
        setIOfferOpen,
        isCapital,
        isCarInsurance,
        isLifeInsurance,
        rateInitialFee,
        setIsCapital,
        setIsCarInsurance,
        setIsLifeInsurance,
        setRateInitialFee,
    };

    return <CreditCalculatorContext.Provider value={contextValue}>{children}</CreditCalculatorContext.Provider>;
};