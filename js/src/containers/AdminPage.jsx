// Admin area. Trainers see the reports; admins also edit content, staff and see the change log.
import { useState } from "react";
import { useTraining } from "../utils/TrainingContext";
import { Chips, Lesson, PageTitle } from "../components/Ui";
import AdminTrainees from "../components/AdminTrainees";
import { AdminModules, AdminVideos, AdminDatasets } from "../components/AdminContent";
import { AdminStaff, AdminLog } from "../components/AdminStaff";

const ADMIN_TABS = [
  ["Trainees", AdminTrainees],
  ["Modules", AdminModules],
  ["Video SOPs", AdminVideos],
  ["Data sets", AdminDatasets],
  ["Staff", AdminStaff],
  ["Change log", AdminLog],
];

export default function AdminPage() {
  const { t } = useTraining();
  const tabs = t.role === "admin" ? ADMIN_TABS : ADMIN_TABS.slice(0, 1);
  const [ix, setIx] = useState(0);
  const Tab = tabs[Math.min(ix, tabs.length - 1)][1];

  return (
    <>
      <PageTitle title="Admin" intro={t.role === "admin" ? "Edit the course, see every trainee's results, and manage who can sign passports." : "See trainee results and sign passports."} />
      <Chips mode="tab" labels={tabs.map((x) => x[0])} value={ix} onChange={setIx} className="mb-4" />
      <Lesson>
        <Tab />
      </Lesson>
    </>
  );
}
