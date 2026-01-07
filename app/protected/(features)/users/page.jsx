import { getUserAccessLevel } from "@/lib/utils/auth/getUserAccessLevel";
import { USERS_SUB_FEATURES } from "@/lib/configs/features/users";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default async function UsersLayout() {
  const access = await getUserAccessLevel();

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Users</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(USERS_SUB_FEATURES).map(([key, config]) => {

          if (access.level < config.minLevel) 
            return null; //hide cards if access level to low
          const Icon = config.icon;
          
          return (
            <Link href={`/protected/users/${key}`} key={key}>
              <Card className="hover:border-primary cursor-pointer transition-all hover:shadow-md">
                <CardHeader>
                  <div className="p-2 w-fit rounded-lg bg-primary/10 text-primary mb-2">
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle>{config.title}</CardTitle>
                  <CardDescription>{config.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}