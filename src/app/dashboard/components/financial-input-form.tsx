"use client";

import { UseFormReturn, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { SimulationInput } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FinancialInputFormProps {
  form: UseFormReturn<SimulationInput>;
  onSubmit: (data: SimulationInput) => void;
  isSimulating: boolean;
}

export function FinancialInputForm({ form, onSubmit, isSimulating }: FinancialInputFormProps) {
  const decisionType = useWatch({
    control: form.control,
    name: "decisionType",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Current Financial Status</CardTitle>
            <CardDescription>Let&apos;s start with your current finances.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField control={form.control} name="monthlyIncome" render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Income</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="50000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="existingEmis" render={({ field }) => (
                <FormItem>
                  <FormLabel>Existing EMIs</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="5000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="currentMonthlySavings" render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Savings</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="15000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="currentSavingsCorpus" render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Savings Corpus</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="500000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="currentAge" render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Age</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="30" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="targetRetirementAge" render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Retirement Age</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="60" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField control={form.control} name="expectedAnnualReturn" render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel>Expected Annual Return (%)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">New Financial Decision</CardTitle>
                <CardDescription>Enter the details of your planned expense.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="decisionType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Decision Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Loan" />
                            </FormControl>
                            <FormLabel className="font-normal">Loan / New EMI</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="Purchase" />
                            </FormControl>
                            <FormLabel className="font-normal">One-time Purchase</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField control={form.control} name="plannedAmount" render={({ field }) => (
                    <FormItem>
                    <FormLabel>{decisionType === 'Loan' ? 'Monthly EMI Amount' : 'Purchase Amount'}</FormLabel>
                    <FormControl>
                        <Input type="number" placeholder={decisionType === 'Loan' ? '10000' : '200000'} {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                
                {decisionType === 'Loan' && (
                    <FormField control={form.control} name="loanDurationYears" render={({ field }) => (
                        <FormItem>
                        <FormLabel>Loan Duration (Years)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="5" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                )}
            </CardContent>
            <CardFooter>
                 <Button type="submit" className="w-full" disabled={isSimulating}>
                    {isSimulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Simulate My Future
                </Button>
            </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
