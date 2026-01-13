
interface TriggerParams {
  event1: string;
  event2: string;
  cityName: string;
  isAutomated: boolean;
  repetitions: number;
  delay: number;
}

export const generateTrigger = ({
  event1,
  event2,
  cityName,
  isAutomated,
  repetitions,
  delay
}: TriggerParams): string => {
  // cityName is only used for organization, not in the actual code
  if (isAutomated) {
    return `Citizen.CreateThread(function()
  local code = json.decode('${event2}')
  for iniciar = 1, ${repetitions} do
      TriggerServerEvent("${event1}", table.unpack(code))
      Citizen.Wait(${delay})
  end
end)`;
  } else {
    return `Citizen.CreateThread(function()
  local code = json.decode('${event2}')
  TriggerServerEvent("${event1}", table.unpack(code))
end)`;
  }
};
