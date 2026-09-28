"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Users, Clock, Target } from "lucide-react";

export type QualificationAnswers = {
  clients: string;
  timeSpent: string;
  goal: string;
};

interface QualificationWizardProps {
  onComplete: (answers: QualificationAnswers) => void;
}

export function QualificationWizard({ onComplete }: QualificationWizardProps) {
  const t = useTranslations("Qualification");
  const [step, setStep] = useState(0); // 0,1,2 = questions, 3 = result
  const [answers, setAnswers] = useState<QualificationAnswers>({
    clients: "",
    timeSpent: "",
    goal: "",
  });

  const select = (key: keyof QualificationAnswers, value: string) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    setTimeout(() => {
      if (step < 2) setStep(step + 1);
      else setStep(3); // show result
    }, 400);
  };

  const finish = () => onComplete(answers);

  const questions = [
    {
      key: "clients" as const,
      icon: Users,
      color: "blue",
      title: t("q1.title"),
      subtitle: t("q1.subtitle"),
      options: [
        { value: "yes_demand", emoji: "📞", label: t("q1.opt1"), example: t("q1.opt1Ex") },
        { value: "some_growth", emoji: "📈", label: t("q1.opt2"), example: t("q1.opt2Ex") },
        { value: "starting", emoji: "🌱", label: t("q1.opt3"), example: t("q1.opt3Ex") },
        { value: "not_sure", emoji: "🤔", label: t("q1.opt4"), example: t("q1.opt4Ex") },
      ],
    },
    {
      key: "timeSpent" as const,
      icon: Clock,
      color: "amber",
      title: t("q2.title"),
      subtitle: t("q2.subtitle"),
      options: [
        { value: "repeat_questions", emoji: "💬", label: t("q2.opt1"), example: t("q2.opt1Ex") },
        { value: "bookings", emoji: "📅", label: t("q2.opt2"), example: t("q2.opt2Ex") },
        { value: "explaining", emoji: "🗣️", label: t("q2.opt3"), example: t("q2.opt3Ex") },
        { value: "finding_clients", emoji: "🔍", label: t("q2.opt4"), example: t("q2.opt4Ex") },
        { value: "nothing_special", emoji: "☕", label: t("q2.opt5"), example: t("q2.opt5Ex") },
      ],
    },
    {
      key: "goal" as const,
      icon: Target,
      color: "green",
      title: t("q3.title"),
      subtitle: t("q3.subtitle"),
      options: [
        { value: "call_book", emoji: "📞", label: t("q3.opt1"), example: t("q3.opt1Ex") },
        { value: "buy", emoji: "🛒", label: t("q3.opt2"), example: t("q3.opt2Ex") },
        { value: "showcase_contact", emoji: "🎨", label: t("q3.opt3"), example: t("q3.opt3Ex") },
        { value: "learn", emoji: "📚", label: t("q3.opt4"), example: t("q3.opt4Ex") },
        { value: "not_sure", emoji: "🤷", label: t("q3.opt5"), example: t("q3.opt5Ex") },
      ],
    },
  ];

  const current = questions[step];

  // Compute personalized result message
  const getResult = () => {
    const needsWebsite =
      answers.clients !== "not_sure" ||
      answers.timeSpent !== "nothing_special" ||
      answers.goal !== "not_sure";

    let headline = "";
    let body = "";
    let points: string[] = [];

    if (answers.clients === "yes_demand") {
      points.push(t("result.pointDemand"));
    } else if (answers.clients === "some_growth") {
      points.push(t("result.pointGrowth"));
    } else if (answers.clients === "starting") {
      points.push(t("result.pointStarting"));
    }

    if (answers.timeSpent === "repeat_questions") {
      points.push(t("result.pointRepeat"));
    } else if (answers.timeSpent === "bookings") {
      points.push(t("result.pointBookings"));
    } else if (answers.timeSpent === "explaining") {
      points.push(t("result.pointExplaining"));
    } else if (answers.timeSpent === "finding_clients") {
      points.push(t("result.pointFinding"));
    }

    if (answers.goal === "call_book") {
      points.push(t("result.pointCall"));
    } else if (answers.goal === "buy") {
      points.push(t("result.pointBuy"));
    } else if (answers.goal === "showcase_contact") {
      points.push(t("result.pointShowcase"));
    } else if (answers.goal === "learn") {
      points.push(t("result.pointLearn"));
    }

    if (needsWebsite && points.length > 0) {
      headline = t("result.yesHeadline");
      body = t("result.yesBody");
    } else {
      headline = t("result.maybeHeadline");
      body = t("result.maybeBody");
      points = [t("result.maybePoint")];
    }

    return { headline, body, points, needsWebsite };
  };

  const colorMap: Record<string, string> = {
    blue: "from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-600",
    amber: "from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-600",
    green: "from-green-500/20 to-green-600/5 border-green-500/30 text-green-600",
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i < step ? "w-8 bg-blue-600" : i === step ? "w-12 bg-blue-600" : "w-8 bg-slate-200"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step < 3 ? (
          <motion.div
            key={`q-${step}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {/* Question header */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${colorMap[current.color]} border mb-4`}>
                <current.icon className="w-7 h-7" />
              </div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {t("questionLabel", { n: step + 1, total: 3 })}
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                {current.title}
              </h2>
              <p className="text-slate-600">{current.subtitle}</p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {current.options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => select(current.key, opt.value)}
                  className="w-full group text-left p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl flex-shrink-0">{opt.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {opt.label}
                      </div>
                      <div className="text-sm text-slate-500 mt-1 leading-relaxed">
                        {opt.example}
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                  </div>
                </button>
              ))}
            </div>

            {/* Back button */}
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="mt-6 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("back")}
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            {(() => {
              const result = getResult();
              return (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mb-6 shadow-lg shadow-green-500/30">
                    {result.needsWebsite ? (
                      <CheckCircle2 className="w-9 h-9 text-white" />
                    ) : (
                      <Sparkles className="w-9 h-9 text-white" />
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
                    {result.headline}
                  </h2>
                  <p className="text-slate-600 mb-8 max-w-md mx-auto">{result.body}</p>

                  <div className="space-y-3 mb-10 max-w-md mx-auto">
                    {result.points.map((point, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.15 }}
                        className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-left"
                      >
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-blue-700">{i + 1}</span>
                        </div>
                        <span className="text-sm text-slate-700 leading-relaxed">{point}</span>
                      </motion.div>
                    ))}
                  </div>

                  <button
                    onClick={finish}
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                  >
                    {result.needsWebsite ? t("result.ctaYes") : t("result.ctaMaybe")}
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <p className="mt-4 text-xs text-slate-400">{t("result.ctaHelp")}</p>
                </div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}