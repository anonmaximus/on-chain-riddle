import { container } from "tsyringe";

import ASeeder from "./ASeeder";
import RolesUpsert from "./RolesUpsert";
import RulesUpsert from "./RulesUpsert";

const Seeders: ASeeder[] = [container.resolve(RulesUpsert), container.resolve(RolesUpsert)] as const;

export default Seeders;
