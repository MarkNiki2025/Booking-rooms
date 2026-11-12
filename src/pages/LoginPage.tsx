import LoginCard from "@/features/auth/components/LoginCard";
function LoginPage() {
  // const [isCreate, setIsCreate] = useState(false);
  // const handleIsCreateTrue = () => {
  //   setIsCreate(true);
  // }
  // const handleIsCreateFalse = () =>{
  //   console.log(isCreate);
  //   setIsCreate(false);
  // }
  return (
    <div className="flex justify-center items-center h-dvh">
      <LoginCard />
    </div>
  )
}

export default LoginPage;