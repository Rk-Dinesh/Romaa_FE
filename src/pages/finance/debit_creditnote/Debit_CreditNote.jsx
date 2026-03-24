import { useState } from "react";
import { Plus } from "lucide-react";
import CreateDebitCreditNote from "./CreateDebitCreditNote";

const Debit_CreditNote = () => {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="font-roboto-flex flex flex-col h-full">
      {/* placeholder — table will be built in next step */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-400">
        <p className="text-sm">Debit / Credit Notes table coming soon</p>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus size={15} /> New Note
        </button>
      </div>

      {showCreate && (
        <CreateDebitCreditNote
          onclose={() => setShowCreate(false)}
          onSuccess={() => setShowCreate(false)}
        />
      )}
    </div>
  );
};

export default Debit_CreditNote;
