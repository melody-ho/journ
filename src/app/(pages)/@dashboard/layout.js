export default function DashboardLayout({ children, entryModal }) {
  return (
    <>
      {entryModal}
      {children}
    </>
  );
}
