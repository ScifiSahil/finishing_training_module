// Training Passport. Trainees see their own sign-off; trainers and admins can fill it in
// (they can also do it for any trainee in the Admin screen).
import { useTraining } from "../utils/TrainingContext";
import { Button, NameField, PageTitle } from "../components/Ui";
import { PassportEditor } from "../components/PassportEditor";

export default function PassportPage() {
  const { t, actions } = useTraining();
  const canEdit = !!t.role;
  const print = () => {
    try {
      window.print();
    } catch (e) {
      actions.showToast("Printing is not available here. Use your browser’s print command.");
    }
  };

  return (
    <>
      <PageTitle
        title="Training Passport"
        intro={canEdit
          ? "Fill in the sign-off for each phase. Phase 1 completes automatically when you pass all module checks and the final assessment."
          : "Your trainer and supervisor sign you off at each phase. Phase 1 completes automatically when you pass all module checks and the final assessment."}
      />
      <div className="mb-3.5">
        <NameField label="Trainee name" />
      </div>
      <PassportEditor
        passport={t.passport}
        readOnly={!canEdit}
        onChange={actions.updatePassport}
        onRefresh={actions.setRefresh}
      />
      <div className="mt-3.5 print:hidden">
        <Button onClick={print}>Print passport</Button>
      </div>
    </>
  );
}