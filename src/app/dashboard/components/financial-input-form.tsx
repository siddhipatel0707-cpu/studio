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
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Lock } from "lucide-react";
import type { SimulationInput } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

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

  const plannedAmount = useWatch({
    control: form.control,
    name: "plannedAmount",
  });

  const withLockIcon = (placeholder: string, field: any) => (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input type="number" placeholder={placeholder} {...field} className="pl-10" />
    </div>
  );


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Decision Simulator</CardTitle>
            <CardDescription>Model your financial future. Adjust the inputs to see the impact.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3']} className="w-full space-y-4">
              <AccordionItem value="item-1" className="border rounded-xl px-4">
                <AccordionTrigger className="font-headline text-lg">Your Profile</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                    <FormField control={form.control} name="monthlyIncome" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Monthly Income</FormLabel>
                            <FormControl>{withLockIcon("75000", field)}</FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="currentAge" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Current Age</FormLabel>
                                <FormControl><Input type="number" placeholder="32" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField control={form.control} name="targetRetirementAge" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Retirement Age</FormLabel>
                                <FormControl><Input type="number" placeholder="62" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border rounded-xl px-4">
                <AccordionTrigger className="font-headline text-lg">Your Savings & Debt</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                    <FormField control={form.control} name="currentSavingsCorpus" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current Savings Corpus</FormLabel>
                            <FormControl>{withLockIcon("1000000", field)}</FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField control={form.control} name="currentMonthlySavings" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Current Monthly Savings</FormLabel>
                            <FormControl>{withLockIcon("20000", field)}</FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField control={form.control} name="existingEmis" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Existing EMIs</FormLabel>
                            <FormControl>{withLockIcon("10000", field)}</FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField control={form.control} name="expectedAnnualReturn" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Expected Annual Return (%)</FormLabel>
                            <FormControl><Input type="number" placeholder="12" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className="border rounded-xl px-4">
                <AccordionTrigger className="font-headline text-lg">New Financial Decision</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                    <FormField control={form.control} name="decisionType" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Decision Type</FormLabel>
                            <FormControl>
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4 pt-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Loan" id="decision-loan" />
                                    <Label htmlFor="decision-loan" className="font-normal">Loan / New EMI</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Purchase" id="decision-purchase" />
                                    <Label htmlFor="decision-purchase" className="font-normal">One-time Purchase</Label>
                                </div>
                            </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField control={form.control} name="decisionName" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Decision Name</FormLabel>
                            <FormControl><Input placeholder="e.g., New Bike, Home Downpayment" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField control={form.control} name="plannedAmount" render={({ field }) => (
                        <FormItem>
                            <div className="flex justify-between items-center">
                                <FormLabel>{decisionType === 'Loan' ? 'Monthly EMI Amount' : 'Purchase Amount'}</FormLabel>
                                <span className="text-lg font-bold text-primary">₹{plannedAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <FormControl>
                                <Slider
                                    min={0}
                                    max={decisionType === 'Loan' ? form.getValues('monthlyIncome') : form.getValues('currentSavingsCorpus')}
                                    step={decisionType === 'Loan' ? 500 : 5000}
                                    onValueChange={(value) => field.onChange(value[0])}
                                    value={[field.value]}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    {decisionType === 'Loan' && (
                        <FormField control={form.control} name="loanDurationYears" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Loan Duration (Years)</FormLabel>
                            <FormControl><Input type="number" placeholder="5" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter>
             <Button type="submit" className="w-full transition-transform duration-300 ease-in-out hover:scale-105" disabled={isSimulating}>
                {isSimulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Run Simulation
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
